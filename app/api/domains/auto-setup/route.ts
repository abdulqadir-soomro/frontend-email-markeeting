import { NextRequest, NextResponse } from "next/server";

// DNS Provider API handlers
const providers = {
  cloudflare: async (config: any) => {
    const { apiKey, domain, dkimTokens } = config;
    
    // Get Zone ID
    const zonesRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const zonesData = await zonesRes.json();
    
    if (!zonesData.success || zonesData.result.length === 0) {
      throw new Error("Domain not found in Cloudflare account");
    }
    
    const zoneId = zonesData.result[0].id;
    
    // Add SPF record
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "TXT",
        name: "@",
        content: "v=spf1 include:amazonses.com ~all",
        ttl: 3600,
      }),
    });
    
    // Add DKIM records
    for (const token of dkimTokens) {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CNAME",
          name: `${token}._domainkey`,
          content: `${token}.dkim.amazonses.com`,
          ttl: 3600,
        }),
      });
    }
  },
  
  hostinger: async (config: any) => {
    const { apiKey, domain, dkimTokens } = config;
    
    // Hostinger API endpoint
    const baseUrl = "https://api.hostinger.com/dns";
    
    // Add SPF record
    await fetch(`${baseUrl}/records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain,
        type: "TXT",
        name: "@",
        content: "v=spf1 include:amazonses.com ~all",
        ttl: 3600,
      }),
    });
    
    // Add DKIM records
    for (const token of dkimTokens) {
      await fetch(`${baseUrl}/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          type: "CNAME",
          name: `${token}._domainkey`,
          content: `${token}.dkim.amazonses.com`,
          ttl: 3600,
        }),
      });
    }
  },
  
  godaddy: async (config: any) => {
    const { apiKey, apiSecret, domain, dkimTokens } = config;
    
    // GoDaddy API endpoint
    const baseUrl = "https://api.godaddy.com/v1";
    
    // Add SPF record
    await fetch(`${baseUrl}/domains/${domain}/records`, {
      method: "PATCH",
      headers: {
        Authorization: `sso-key ${apiKey}:${apiSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          type: "TXT",
          name: "@",
          data: "v=spf1 include:amazonses.com ~all",
          ttl: 3600,
        },
      ]),
    });
    
    // Add DKIM records
    const dkimRecords = dkimTokens.map((token: string) => ({
      type: "CNAME",
      name: `${token}._domainkey`,
      data: `${token}.dkim.amazonses.com`,
      ttl: 3600,
    }));
    
    await fetch(`${baseUrl}/domains/${domain}/records`, {
      method: "PATCH",
      headers: {
        Authorization: `sso-key ${apiKey}:${apiSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dkimRecords),
    });
  },
  
  namecheap: async (config: any) => {
    const { apiKey, apiSecret, domain, dkimTokens } = config;
    
    // Namecheap uses XML API
    const baseUrl = "https://api.namecheap.com/xml.response";
    
    // Extract domain parts
    const parts = domain.split(".");
    const sld = parts[0];
    const tld = parts.slice(1).join(".");
    
    // Add SPF record
    const spfParams = new URLSearchParams({
      ApiUser: apiSecret,
      ApiKey: apiKey,
      UserName: apiSecret,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: "0.0.0.0",
      SLD: sld,
      TLD: tld,
      RecordType1: "TXT",
      HostName1: "@",
      Address1: "v=spf1 include:amazonses.com ~all",
      TTL1: "3600",
    });
    
    // Add DKIM records to params
    dkimTokens.forEach((token: string, index: number) => {
      const recordNum = index + 2;
      spfParams.append(`RecordType${recordNum}`, "CNAME");
      spfParams.append(`HostName${recordNum}`, `${token}._domainkey`);
      spfParams.append(`Address${recordNum}`, `${token}.dkim.amazonses.com`);
      spfParams.append(`TTL${recordNum}`, "3600");
    });
    
    await fetch(`${baseUrl}?${spfParams.toString()}`);
  },
  
  digitalocean: async (config: any) => {
    const { apiKey, domain, dkimTokens } = config;
    
    const baseUrl = "https://api.digitalocean.com/v2";
    
    // Add SPF record
    await fetch(`${baseUrl}/domains/${domain}/records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "TXT",
        name: "@",
        data: "v=spf1 include:amazonses.com ~all",
        ttl: 3600,
      }),
    });
    
    // Add DKIM records
    for (const token of dkimTokens) {
      await fetch(`${baseUrl}/domains/${domain}/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CNAME",
          name: `${token}._domainkey`,
          data: `${token}.dkim.amazonses.com.`,
          ttl: 3600,
        }),
      });
    }
  },
};

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, apiSecret, domain, dkimTokens, userId, domainId } = await req.json();

    if (!provider || !apiKey || !domain || !dkimTokens || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the provider handler
    const providerHandler = providers[provider as keyof typeof providers];
    
    if (!providerHandler) {
      return NextResponse.json(
        { error: "Unsupported DNS provider" },
        { status: 400 }
      );
    }

    // Execute the DNS setup
    try {
      await providerHandler({
        apiKey,
        apiSecret,
        domain,
        dkimTokens,
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: `Failed to setup DNS records: ${error.message || "Unknown error"}`,
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "DNS records added successfully" 
    });
  } catch (error: any) {
    console.error("Error in auto-setup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup DNS records" },
      { status: 500 }
    );
  }
}

