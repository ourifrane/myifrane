import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
  let transporter;

  if (process.env.NODE_ENV === "development") {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const info = await transporter.sendMail({
    from: '"MyIfrane" <no-reply@myifrane.com>',
    to,
    subject: "Verify your email",
    text: `Click here to verify: ${process.env.APP_URL}/api/verify?token=${token}`,
    html: `<p>Click here to verify: <a href="${process.env.APP_URL}/api/verify?token=${token}">Verify Email</a></p>`,
  });

  if (process.env.NODE_ENV === "development") {
    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
  }
}
