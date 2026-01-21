import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Nota: Vercel inyecta las variables de entorno automáticamente si están configuradas en el panel.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Handling (Opcional, pero bueno tenerlo)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, email, projectType } = req.body;

        // Validate Input
        if (!name || !email) {
            return res.status(400).json({ error: 'Missing required fields: name or email' });
        }

        const smtpUser = process.env['SMTP_USER'];
        const smtpPass = process.env['SMTP_PASS'];

        if (!smtpUser || !smtpPass) {
            // In Serverless/Production, we cannot run Ethereal reliably due to timeouts/restrictions.
            // We must have ENV variables set.
            console.error('Missing SMTP_USER or SMTP_PASS environment variables in Vercel.');
            return res.status(500).json({
                success: false,
                error: 'Server Misconfiguration: SMTP Credentials not set in Vercel Environment.'
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        try {
            await transporter.verify();
        } catch (verifyError: any) {
            console.error('SMTP Connection Failed:', verifyError);
            return res.status(500).json({
                success: false,
                error: `SMTP Connection Failed: ${verifyError.message}`
            });
        }

        const info = await transporter.sendMail({
            from: '"Velocify System" <system@velocifystudio.com>',
            to: "javo.delara@gmail.com",
            subject: `Nueva Solicitud: ${name}`,
            text: `Nueva solicitud: ${name} (${email}) - Proyecto: ${projectType}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Nueva Solicitud de Cotización</h2>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Proyecto:</strong> ${projectType}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Velocify Studio</p>
        </div>
      `,
        });

        console.log("Message sent: %s", info.messageId);

        res.status(200).json({
            success: true,
            message: 'Email sent via Gmail'
        });

    } catch (error: any) {
        console.error('Detailed Error sending email:', error);
        // Return the actual error message to help debugging
        res.status(500).json({
            success: false,
            error: `Failed to send email: ${error.message || error}`
        });
    }
}
