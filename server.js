const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const nodemailer = require("nodemailer")
const mercadopago = require("mercadopago");
const bodyParser = require("body-parser");
const { configDotenv } = require("dotenv");

// REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://developers.mercadopago.com/panel
mercadopago.configure({
	access_token: process.env.TOKEN,
});
//"APP_USR-8053005066592321-082722-aa7cdc672da067cf92cd3757156955d5-231799293"


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("../../sib-ecommerce"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.get("/", function (req, res) {
	res.status(200).sendFile("public/index.html", {root});
});


// METODO POST
app.post("/create_preference", (req, res) => {
	let preference = {
		items: [
			{
				title: req.body.title,
				unit_price: Number(req.body.price),
				quantity: Number(req.body.quantity),
				currency_id: 'UYU'
			}
		],
		back_urls: {
			/*
			"success": "https://sib.com.uy/#/feedback",
			"failure": "https://sib.com.uy/#/feedback",
			"pending": "https://sib.com.uy/#/feedback"
			*/
			"success": "http://localhost:3000/#/feedback/:false",
			"failure": "http://localhost:3000/#/feedback",
			"pending": "http://localhost:8080/feedback"
		},
		auto_return: "approved",
	};

	mercadopago.preferences.create(preference)
		.then(function (response) {
			res.json({
				id: response.body.id
			});
		}).catch(function (error) {
			console.log(error);
		});
});

// METODO POST
app.post("/contacto", (req, res) => {

	const transporter = nodemailer.createTransport({
		host: "smtp.titan.email",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});

	const mailOptions = {
		replyTo: req.body.userMail,
		from: process.env.EMAIL,
        to: "juanchisacco@gmail.com",
			subject: "ENVIADO DESDE CONTACTO SIB.COM.UY ",
        html: `<b>Nombre: </b> <p>${req.body.nombre}</p> <br></br> <b>Apellido: </b> 
		<p>${req.body.apellido}</p> <br></br> <b>Email: </b> <p>${req.body.email}</p> <br></br> <b>Asunto: </b> 
		<p>${req.body.asunto}</p> <br></br> <b>Mensaje: </b> <p>${req.body.mensaje}`
	}

	transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            res.status(500).send(error.message)
        } else {
            console.log("Email enviado")
            res.status(200).json(req.body);
        }
      })
})

// METODO POST
app.post("/feedback", (req, res) => {

	const transporter = nodemailer.createTransport({
		host: "smtp.titan.email",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});

	const mailOptions = {
		replyTo: req.body.userMail,
		from: process.env.EMAIL,
        to: "juanchisacco@gmail.com",
        subject: "NUEVA COMPRA DESDE SIB.COM.UY ",
        html: `<b>Nombre completo: </b> <p>${req.body.userMailName + " " + req.body.userMailLastname}</p> <b>Email: </b>
		 <p>${req.body.userMail}</p> <b>Telefono: </b> <p>${req.body.userPhone}</p> <b>Direccion: </b> 
		 <p>${req.body.userAdress}</p> <b>Localidad: </b> <p>${req.body.userState}</p> <b>Numero: </b> 
		 <p>${req.body.userAdressNumber} <br/> <hr/> <b>Informacion de compra: </b> <br/> <br/> <b>Payment ID: </b> 
		 <p>${req.body.userPaymentId}</p> <br/> <b>Tipo de compra: </b><p>${req.body.tipoDeEnvio}</p>`
	}

	transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            res.status(500).send(error.message)
        } else {
            console.log("Email enviado")
            res.status(200).json(req.body);
        }
      })
})

//METODO POST
app.post("/sin_stock", (req, res) => {

	const transporter = nodemailer.createTransport({
		host: "smtp.titan.email",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});

    let mailBody = ""; // Variable para almacenar el contenido del correo

    req.body.forEach(element => {
        mailBody += `<b>Nombre Producto: </b> <p>${element.nombreProdSinStock}</p> <br/> <b>Color Producto: </b> 
					<p>${element.colorProdSinStock}</p> <br/> <b>Talle Producto: </b> <p>${element.talleProdSinStock}
					</p> <br/> <b>Stock: </b> <p>${element.stockProdSinStock}</p> <br/><hr/>`;
    });

    const mailOptions = {
        replyTo: req.body.userMail,
        from: process.env.EMAIL,
        to: "juanchisacco@gmail.com",
        subject: "PRODUCTO SIN STOCK SIB.COM.UY ",
        html: mailBody
    }

	transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            res.status(500).send(error.message)
        } else {
            console.log("Email enviado")
            res.status(200).json(req.body);
        }
      })
})

// METODO GET
app.get('/feedback', function (req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	});
});

app.listen(8080,  () => {
	console.log("The server is now running on Port 8080");
});