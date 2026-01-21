const nodemailer = require('nodemailer');

// Nota: Vercel inyecta las variables de entorno automáticamente si están configuradas en el panel.

module.exports = async (req: any, res: any) => {
    // CORS Handling
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
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { name, email, projectType } = req.body;

        // Validate Input
        if (!name || !email) {
            res.status(400).json({ error: 'Missing required fields: name or email' });
            return;
        }

        // Depuración de variables de entorno con notación de corchetes segura para CommonJS/Node
        const smtpUser = process.env['SMTP_USER'];
        const smtpPass = process.env['SMTP_PASS'];

        console.log('Environment Debug:', {
            hasUser: !!smtpUser,
            userLength: smtpUser ? smtpUser.length : 0,
            hasPass: !!smtpPass,
            passLength: smtpPass ? smtpPass.length : 0
        });

        if (!smtpUser || !smtpPass) {
            console.error('Missing SMTP_USER or SMTP_PASS environment variables in Vercel.');
            res.status(500).json({
                success: false,
                error: 'Server Misconfiguration: SMTP Credentials not set in Vercel Environment.'
            });
            return;
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Optimización: Saltamos verify() para evitar timeouts en Serverless
        // await transporter.verify();

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
        return;

    } catch (error) {
        console.error('Detailed Error sending email:', error);
        // Return the actual error message to help debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({
            success: false,
            error: `Failed to send email: ${errorMessage}`
        });
        return;
    }
};
