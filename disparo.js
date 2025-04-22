import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// Decode do base64 para JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const enviarEmails = async () => {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const snapshot = await db.collection('usuarios').get();

  snapshot.forEach(doc => {
    const user = doc.data();
    if (user.afastamento === hoje || user.retorno === hoje) {
      const tipo = user.afastamento === hoje ? 'Afastamento' : 'Retorno';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_DESTINO,
        subject: `📣 ${tipo} - ${user.nome}`,
        text: `Usuário: ${user.nome}\nFunção: ${user.funcao}\nTipo: ${tipo}\nData: ${hoje}`
      };

      transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) console.error('❌ Erro:', erro);
        else console.log('✅ E-mail enviado:', info.response);
      });
    }
  });
};

enviarEmails();