import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import nodemailer from 'nodemailer';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware to parse JSON bodies
app.use(express.json());

// API: Send Quotation Email


// Load environment variables (create a .env file locally)
import 'dotenv/config';

app.post('/api/quotation', async (req, res) => {
  try {
    const { name, email, projectType } = req.body;
    let transporter;

    // Check for Real SMTP Credentials (Gmail or other)
    const smtpUser = process.env['SMTP_USER'];
    const smtpPass = process.env['SMTP_PASS'];

    if (smtpUser && smtpPass) {
      // Use Real Gmail/SMTP Service
      console.log(`Using Real SMTP for: ${smtpUser}`);
      transporter = nodemailer.createTransport({
        service: 'gmail', // Built-in service for Gmail
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Fallback to Ethereal (Testing)
      console.log('No SMTP credentials found. Using Ethereal (Fake) Email.');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: '"Velocify Studio System" <system@velocifystudio.com>', // Note: standard gmail will override this to the authenticated user
      to: "javo.delara@gmail.com",
      subject: `Nueva Solicitud de Cotización: ${name}`,
      text: `
        Nueva solicitud recibida:
        --------------------------
        Nombre: ${name}
        Email: ${email}
        Tipo de Proyecto: ${projectType}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Nueva Solicitud de Cotización</h2>
          <p>Has recibido una nueva solicitud desde la Landing Page.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Proyecto:</strong> ${projectType}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Velocify Studio Automated System</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    // Only show preview URL if using Ethereal
    if (!smtpUser) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({
      success: true,
      message: smtpUser ? 'Email sent via Gmail' : 'Email sent via Ethereal (Check server logs)',
      previewUrl: smtpUser ? null : nodemailer.getTestMessageUrl(info)
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});


/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
