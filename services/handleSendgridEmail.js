const sgMail = require('@sendgrid/mail')

exports.handleSendGrideEmailSend = async (user_email, template, sender, subject='') => {
    let mail_sent = 0;


    sgMail.setApiKey(process.env.SENDGRID_APY_KEY);

    console.log("<mail_subject>>>>>>>>>>>>>accept-reduced-cost-mail>>>>>",typeof subject)

    const messageForCustomer = {
        to: user_email, // Change to your recipient
        from: sender, // Change to your verified sender
        subject: subject,
        html: template,
    }

    try {
        mail_sent = await sgMail.send(messageForCustomer);
        // console.log("mail_sent Response",mail_sent[0].statusCode);
        // console.log("mail_sent Response",mail_sent[0].headers);


        if ((mail_sent[0].statusCode == 200 || mail_sent[0].statusCode == 202 || mail_sent[0].statusCode == "200" || mail_sent[0].statusCode == "202")) {
            return {
                mail_sent: 1,
                message: 'Please Check Your Mail.',
            }
        }

    } catch (error) {
        return {
            mail_sent: 0,
            message: error,
        }
    }

}