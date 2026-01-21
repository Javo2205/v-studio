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
        let transporter;

        const smtpUser = process.env['SMTP_USER'];
        const smtpPass = process.env['SMTP_PASS'];

        if (smtpUser && smtpPass) {
            // Modo Real (Gmail/SMTP)
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
        } else {
            // Modo Prueba (Ethereal)
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
            from: '"Velocify Studio System" <system@velocifystudio.com>',
            to: "javo.delara@gmail.com",
            subject: `Nueva Solicitud de Cotización: ${name}`,
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
            message: smtpUser ? 'Email sent via Gmail' : 'Email sent via Ethereal',
            previewUrl: smtpUser ? null : nodemailer.getTestMessageUrl(info)
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
}
