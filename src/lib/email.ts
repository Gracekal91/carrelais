import { Resend } from "resend";
import { getBaseUrl } from "@/lib/url";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Car Relais <support@carrelais.com>";
const APP_URL = getBaseUrl();

/**
 * Base email layout with Car Relais branding
 */
function getEmailHtml({
  title,
  preheader,
  contentHtml,
}: {
  title: string;
  preheader: string;
  contentHtml: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; color: #18181b; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background-color: #ffffff; border-radius: 16px; padding: 36px 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e4e4e7; }
    .brand-logo { display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #ba5507; text-decoration: none; letter-spacing: -0.5px; }
    .brand-badge { background-color: #fff7ed; color: #ba5507; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 9999px; margin-left: 8px; text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 700; color: #18181b; margin: 0 0 16px 0; text-align: center; }
    .otp-container { background-color: #fff7ed; border: 2px dashed #ba5507; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ba5507; margin: 0; }
    .otp-hint { font-size: 12px; color: #9a4405; margin-top: 8px; font-weight: 500; }
    .btn { display: inline-block; background-color: #ba5507; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; text-align: center; margin-top: 16px; }
    .btn:hover { background-color: #9a4405; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #71717a; line-height: 1.5; }
    .divider { height: 1px; background-color: #e4e4e7; margin: 24px 0; }
    .note { font-size: 13px; color: #52525b; line-height: 1.6; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="wrapper">
    <div class="card">
      <div class="brand-header">
        <a href="${APP_URL}" class="brand-logo">
          Car Relais <span class="brand-badge">RDC</span>
        </a>
      </div>
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Car Relais — Première marketplace automobile en RDC</p>
      <p>Cet email a été envoyé par Car Relais (<a href="mailto:support@carrelais.com" style="color: #059669; text-decoration: none;">support@carrelais.com</a>).</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Send OTP verification code for new user registration
 */
export async function sendVerificationOtpEmail(toEmail: string, recipientName: string, otp: string) {
  const title = "Vérifiez votre compte Car Relais";
  const preheader = `Votre code de validation Car Relais est : ${otp}`;
  
  const contentHtml = `
    <h1 class="title">${title}</h1>
    <p class="note">Bonjour <strong>${recipientName || "cher membre"}</strong>,</p>
    <p class="note">Merci d'avoir rejoint Car Relais ! Pour activer votre compte et commencer à publier ou rechercher des véhicules, veuillez saisir ce code de vérification :</p>
    
    <div class="otp-container">
      <div class="otp-code">${otp}</div>
      <div class="otp-hint">Ce code expire dans 15 minutes</div>
    </div>

    <p class="note">Vous pouvez également cliquer sur le bouton ci-dessous pour confirmer votre compte directement :</p>
    <div style="text-align: center;">
      <a href="${APP_URL}/verify-email?email=${encodeURIComponent(toEmail)}&code=${otp}" class="btn">
        Vérifier mon compte
      </a>
    </div>

    <div class="divider"></div>
    <p class="note" style="font-size: 12px; color: #a1a1aa;">
      Si vous n'avez pas créé de compte sur Car Relais, ignorez cet email. Ne partagez ce code avec personne.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Votre code de validation Car Relais : ${otp}`,
      html: getEmailHtml({ title, preheader, contentHtml }),
    });

    if (error) {
      console.warn(`[Email Service Warning] Resend failed for ${toEmail}:`, error.message);
      return { success: false, error: error.message, otp };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error(`[Email Service Error] Failed to send verification email to ${toEmail}:`, err);
    return { success: false, error: err.message, otp };
  }
}

/**
 * 2. Send 6-digit PIN for password reset
 */
export async function sendPasswordResetOtpEmail(toEmail: string, recipientName: string, pin: string) {
  const title = "Réinitialisation de votre mot de passe";
  const preheader = `Votre code PIN de réinitialisation est : ${pin}`;

  const contentHtml = `
    <h1 class="title">${title}</h1>
    <p class="note">Bonjour <strong>${recipientName || "cher membre"}</strong>,</p>
    <p class="note">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Car Relais lié à cette adresse email.</p>
    <p class="note">Voici votre code PIN de sécurité :</p>

    <div class="otp-container">
      <div class="otp-code">${pin}</div>
      <div class="otp-hint">Valable pendant 15 minutes</div>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/reset-password?email=${encodeURIComponent(toEmail)}&pin=${pin}" class="btn">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <div class="divider"></div>
    <p class="note" style="font-size: 12px; color: #a1a1aa;">
      Si vous n'avez pas demandé cette réinitialisation, votre compte est sécurisé et vous pouvez ignorer ce message.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Code de réinitialisation Car Relais : ${pin}`,
      html: getEmailHtml({ title, preheader, contentHtml }),
    });

    if (error) {
      console.warn(`[Email Service Warning] Resend reset password failed for ${toEmail}:`, error.message);
      return { success: false, error: error.message, pin };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error(`[Email Service Error] Reset password email error for ${toEmail}:`, err);
    return { success: false, error: err.message, pin };
  }
}

/**
 * 3. Send PIN code to authorize password change from dashboard
 */
export async function sendChangePasswordOtpEmail(toEmail: string, recipientName: string, pin: string) {
  const title = "Confirmation de modification de mot de passe";
  const preheader = `Votre code PIN de confirmation : ${pin}`;

  const contentHtml = `
    <h1 class="title">${title}</h1>
    <p class="note">Bonjour <strong>${recipientName || "cher membre"}</strong>,</p>
    <p class="note">Une modification de mot de passe a été demandée depuis votre espace personnel Car Relais.</p>
    <p class="note">Veuillez utiliser ce code PIN pour confirmer le changement de votre mot de passe :</p>

    <div class="otp-container">
      <div class="otp-code">${pin}</div>
      <div class="otp-hint">Ce code expire dans 15 minutes</div>
    </div>

    <div class="divider"></div>
    <p class="note" style="font-size: 12px; color: #a1a1aa;">
      Si vous n'êtes pas à l'origine de cette action, changez immédiatement votre mot de passe et contactez-nous à support@carrelais.com.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Code de sécurité Car Relais : ${pin}`,
      html: getEmailHtml({ title, preheader, contentHtml }),
    });

    if (error) {
      console.warn(`[Email Service Warning] Resend change password failed for ${toEmail}:`, error.message);
      return { success: false, error: error.message, pin };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error(`[Email Service Error] Change password email error for ${toEmail}:`, err);
    return { success: false, error: err.message, pin };
  }
}

/**
 * 4. Send notification when Admin approves a vehicle listing
 */
export async function sendListingApprovedEmail(
  toEmail: string,
  recipientName: string,
  vehicleTitle: string,
  vehicleSlug: string
) {
  const title = "Votre annonce a été approuvée ! 🎉";
  const preheader = `Félicitations, votre annonce pour ${vehicleTitle} est maintenant en ligne sur Car Relais.`;
  const listingUrl = `${APP_URL}/vehicles/${vehicleSlug}`;

  const contentHtml = `
    <h1 class="title" style="color: #059669;">${title}</h1>
    <p class="note">Bonjour <strong>${recipientName || "cher vendeur"}</strong>,</p>
    <p class="note">
      Excellente nouvelle ! L'équipe d'administration de Car Relais vient de valider et publier votre annonce pour :
    </p>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border-left: 4px solid #059669;">
      <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #18181b;">${vehicleTitle}</h3>
      <p style="margin: 0; font-size: 13px; color: #71717a;">Statut : <span style="color: #059669; font-weight: 700;">En ligne (PUBLIÉ)</span></p>
    </div>

    <p class="note">
      Votre véhicule est désormais visible par tous les acheteurs sur notre marketplace. Vous recevrez directement les contacts des acheteurs intéressés via vos canaux de contact (WhatsApp / Téléphone).
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${listingUrl}" class="btn">
        Voir mon annonce en ligne
      </a>
    </div>

    <div class="divider"></div>
    <p class="note" style="font-size: 13px; color: #71717a;">
      Vous pouvez gérer et suivre les statistiques de cette annonce (vues, contacts) à tout moment depuis votre <a href="${APP_URL}/dashboard/listings" style="color: #059669; font-weight: 600; text-decoration: none;">tableau de bord</a>.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Annonce approuvée : ${vehicleTitle} est maintenant en ligne !`,
      html: getEmailHtml({ title, preheader, contentHtml }),
    });

    if (error) {
      console.warn(`[Email Service Warning] Listing approved email failed for ${toEmail}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error(`[Email Service Error] Listing approved email error for ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * 5. Send notification when Admin declines a vehicle listing
 */
export async function sendListingDeclinedEmail(
  toEmail: string,
  recipientName: string,
  vehicleTitle: string,
  reason: string,
  comment?: string
) {
  const title = "Mise à jour concernant votre annonce";
  const preheader = `Votre annonce pour ${vehicleTitle} n'a pas pu être validée.`;
  const dashboardUrl = `${APP_URL}/dashboard/listings`;

  const contentHtml = `
    <h1 class="title" style="color: #dc2626;">${title}</h1>
    <p class="note">Bonjour <strong>${recipientName || "cher vendeur"}</strong>,</p>
    <p class="note">
      Après examen par notre équipe de modération, nous vous informons que votre annonce pour <strong>${vehicleTitle}</strong> n'a pas été retenue pour la raison suivante :
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #dc2626; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #991b1b;">
        Motif du refus : ${reason}
      </p>
      ${comment ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #b91c1c; font-style: italic;">« ${comment} »</p>` : ""}
    </div>

    <p class="note">
      Ne vous inquiétez pas : vous pouvez facilement corriger ces informations et soumettre à nouveau votre annonce depuis votre espace vendeur.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${dashboardUrl}" class="btn" style="background-color: #18181b;">
        Modifier mon annonce
      </a>
    </div>

    <div class="divider"></div>
    <p class="note" style="font-size: 12px; color: #a1a1aa;">
      Si vous avez des questions, notre support est à votre disposition à <a href="mailto:support@carrelais.com" style="color: #059669; text-decoration: none;">support@carrelais.com</a>.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Information concernant votre annonce : ${vehicleTitle}`,
      html: getEmailHtml({ title, preheader, contentHtml }),
    });

    if (error) {
      console.warn(`[Email Service Warning] Listing declined email failed for ${toEmail}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error(`[Email Service Error] Listing declined email error for ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
}
