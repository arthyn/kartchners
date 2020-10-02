if (process.env.NODE_ENV !== 'production') {
	require('dotenv').load();
}

const mailjet = require('node-mailjet').connect(process.env.MAILJET_API, process.env.MAILJET_SECRET);
const escape = require('lodash.escape');

let debug = process.argv[2];
debug = debug == '-d';

if(debug) {
	console.log('Running in debug mode...');
}

exports.handler = async function(event, context) {
    const to = debug ? 'hunter@hmiller.dev' : 'office@kartchnersinscott.com';
    const body = JSON.parse(event.body);

	const email = escape(body.email);
    const name = escape(body.name);
    const phone = escape(body.phone);
    const message = escape(body.message);

    const html = `
<p>${message}</p>
<p>Name: ${name}</p>
<p>Email: ${email}</p>
<p>Phone number: ${phone}</p>`;
    
    try {
        const response = await mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[
                    {
                        "From": {
                            "Email": 'hunter@hmiller.dev',
                            "Name": 'Hunter'
                        },
                        "To": [{ "Email": to }],
                        "Subject": `[Contact Form Submission] ${name}`,
                        "HTMLPart": html
                    }
                ]
            });

        const responseData = response.body;
        console.log(responseData);
        if (responseData.Messages[0].Status === 'error') {
            throw new Error(responseData.Messages[0].Errors.map(error => error.ErrorMessage).join());
        }
        
        return {
            statusCode: 200,
            body: 'success'
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: error
        };
    }
}