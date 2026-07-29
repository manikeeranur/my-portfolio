import { NextResponse } from "next/server";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function launchBrowser() {
  if (process.platform === "linux") {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    const chromiumBin = path.join(
      process.cwd(),
      "node_modules",
      "@sparticuz",
      "chromium",
      "bin"
    );
    return puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: await chromium.executablePath(chromiumBin),
      headless: true,
    });
  }
  const puppeteer = await import("puppeteer");
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

// GET /api/pdf — public. Renders /myresume via Puppeteer and streams a PDF.
export async function GET(req) {
  let browser = null;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1080 });

    const origin = process.env.FRONTEND_URL || new URL(req.url).origin;
    await page.goto(`${origin}/myresume`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    await page.waitForSelector("#resume-content", { timeout: 15000 });

    await page.addStyleTag({
      content: `
        .resume-topbar { display: none !important; }
        html, body, .my-resume, #resume-content {
          background: #fff !important;
        }
        html, body {
          overflow: visible !important;
        }
        .my-resume, #resume-content {
          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
        }
        #resume-content {
          transform: scale(0.995) !important;
          transform-origin: top center !important;
        }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      `,
    });

    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
    });

    const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Manikandan_Resume.pdf"',
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: err.message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
  }
}
