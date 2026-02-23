import express, { Request, Response } from "express";
import ejs from "ejs";
import { MailtrapClient } from "mailtrap";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import { Resend } from "resend";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SendMailOptions {
    email: string;
    subject: string;
    template: string;
    data: Record<string, unknown>;
}

const sendMail = async (options: SendMailOptions): Promise<void> => {
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpService = process.env.SMTP_SERVICE?.toLowerCase();
    const smtpHost = process.env.SMTP_HOST ?? (smtpService === "gmail" ? "smtp.gmail.com" : undefined);

    const transportOptions = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        family: 4,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    };

    const transporter: Transporter = nodemailer.createTransport(transportOptions as any);

    const { email, subject, template, data } = options;

    const templatePath = path.join(__dirname, "../mails", template);
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        users: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
        ],
    })
})

router.get("/:id", (req: Request, res: Response) => {
    const userId = req.params.id;
    return res.status(200).json({
        id: userId,
        name: "Sample User",
    })
})

router.post("/", (req: Request, res: Response) => {
    const { name } = req.body;
    return res.status(201).json({
        message: "User created",
        user: { id: 3, name },
    })
})

router.post("/send-mail", async (req: Request, res: Response) => {
    const to = "akshay57@gmail.com"
    const subject = "hello"
        const html = `<!doctype html>
<html>
    <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:10px; padding:24px;">
                        <tr>
                            <td>
                                <h1 style="margin:0 0 12px; color:#111827;">Welcome 👋</h1>
                                <p style="margin:0 0 16px; color:#374151; line-height:1.6;">
                                    Thanks for signing up. This is a sample HTML email sent using Resend.
                                </p>
                                <a href="https://example.com" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:8px;">
                                    Verify Email
                                </a>
                                <p style="margin:20px 0 0; color:#6b7280; font-size:12px;">
                                    If you didn’t request this, you can ignore this message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`

    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({
            message: "Missing RESEND_API_KEY environment variable",
        });
    }

    if (!to || !subject || !html) {
        return res.status(400).json({
            message: "Required fields: to, subject, html",
        });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
            to,
            subject,
            html,
        });

        return res.status(200).json({
            message: "Email sent",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send email",
            error,
        });
    }
})

router.post("/send-mail-brevo", async (req: Request, res: Response) => {
    const to = "akshaykalangi57@gmail.com"
    const subject = "hello from brevo"
    const html = `<!doctype html>
<html>
    <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:10px; padding:24px;">
                        <tr>
                            <td>
                                <h1 style="margin:0 0 12px; color:#111827;">Welcome 👋</h1>
                                <p style="margin:0 0 16px; color:#374151; line-height:1.6;">
                                    This is a sample HTML email sent using Brevo API.
                                </p>
                                <a href="https://example.com" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:8px;">
                                    Open Dashboard
                                </a>
                                <p style="margin:20px 0 0; color:#6b7280; font-size:12px;">
                                    If you didn’t request this, you can ignore this message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`

    if (!process.env.BREVO_API_KEY) {
        return res.status(500).json({
            message: "Missing BREVO_API_KEY environment variable",
        });
    }

    if (!to || !subject || !html) {
        return res.status(400).json({
            message: "Required fields: to, subject, html",
        });
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME ?? "App Team",
                    email: process.env.BREVO_SENDER_EMAIL ?? "sender@example.com",
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Failed to send email with Brevo",
                result,
            });
        }

        return res.status(200).json({
            message: "Email sent with Brevo",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send email with Brevo",
            error,
        });
    }
})

router.post("/send-mail-mailtrap", async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    const token = process.env.MAILTRAP_API_TOKEN;

    if (!token) {
        return res.status(500).json({
            message: "Missing MAILTRAP_API_TOKEN environment variable",
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Required field: email",
        });
    }

    const client = new MailtrapClient({ token });
    const sender = {
        email: process.env.MAILTRAP_SENDER_EMAIL ?? "hello@demomailtrap.co",
        name: process.env.MAILTRAP_SENDER_NAME ?? "Mailtrap Test",
    };

    try {
        const result = await client.send({
            from: sender,
            to: [{ email }],
            subject: "You are awesome!",
            text: "Congrats for sending test email with Mailtrap!",
            category: "Integration Test",
        });

        return res.status(200).json({
            message: "Email sent with Mailtrap",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send email with Mailtrap",
            error,
        });
    }
});

router.post("/send-mail-mailjet", async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    const apiKey = process.env.MAILJET_API_KEY;
    const secretKey = process.env.MAILJET_SECRET_KEY;
    const fromEmail = process.env.MAILJET_SENDER_EMAIL ?? "noreply@example.com";
    const fromName = process.env.MAILJET_SENDER_NAME ?? "App Team";

    if (!apiKey || !secretKey) {
        return res.status(500).json({
            message: "Missing Mailjet config. Set MAILJET_API_KEY and MAILJET_SECRET_KEY.",
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Required field: email",
        });
    }

    try {
        const basicAuth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
        const response = await fetch("https://api.mailjet.com/v3.1/send", {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuth}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                Messages: [
                    {
                        From: {
                            Email: fromEmail,
                            Name: fromName,
                        },
                        To: [
                            {
                                Email: email,
                            },
                        ],
                        Subject: "Mailjet test email",
                        TextPart: "Hello from Mailjet API route",
                    },
                ],
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Failed to send email with Mailjet",
                result,
            });
        }

        return res.status(200).json({
            message: "Email sent with Mailjet",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send email with Mailjet",
            error,
        });
    }
});

router.post("/send-mail-smtp", async (req: Request, res: Response) => {
    const { email } = req.body as {
        email?: string;
    };
    const subject = "Welcome to our app";
    const template = process.env.SMTP_TEMPLATE ?? "welcome.ejs";
    const data: Record<string, unknown> = { appName: "My App" };

    const mailerSendApiKey = process.env.MAILERSEND_API_KEY ?? process.env.MAILER_SEND;
    const mailerSendFromEmail = process.env.MAILERSEND_FROM_EMAIL ?? process.env.SMTP_MAIL;
    const mailerSendFromName = process.env.MAILERSEND_FROM_NAME ?? "App Team";

    if (!mailerSendApiKey || !mailerSendFromEmail) {
        return res.status(500).json({
            message: "Missing MailerSend config. Set MAILERSEND_API_KEY (or MAILER_SEND) and MAILERSEND_FROM_EMAIL (or SMTP_MAIL).",
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Required field: email",
        });
    }

    try {
        const templatePath = path.join(__dirname, "../mails", template);
        const html: string = await ejs.renderFile(templatePath, data);

        const response = await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${mailerSendApiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                from: {
                    email: mailerSendFromEmail,
                    name: mailerSendFromName,
                },
                to: [{
                    email,
                }],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const result = await response.text();
            return res.status(response.status).json({
                message: "Failed to send email with MailerSend API",
                result,
            });
        }

        return res.status(200).json({
            message: "Email sent with MailerSend API",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send email with MailerSend API",
            error,
        });
    }
});

export default router
