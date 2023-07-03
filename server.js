const express = require("express");
const app = express();
const http = require('http');
require('dotenv').config();
const cors = require("cors");
const mercadopago = require("mercadopago");
const bodyParser = require("body-parser");

// REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://developers.mercadopago.com/panel
mercadopago.configure({
	access_token: "TEST-4154151932303591-050412-3c910fce57a38d516772d359873cc271-648132542",
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("../../sib-ecommerce"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.get("/", function (req, res) {
	res.status(200).sendFile("public/index.html", {root});
});

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
			"success": "http://localhost:3000/feedback",
			"failure": "http://localhost:3000/feedback",
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

app.get('/feedback', function (req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	});
});

// app.listen(8080,  () => {
// 	console.log("The server is now running on Port 8080");
// });


const serverHttp = http.createServer(app);
serverHttp.listen(process.env.HTTP_PORT, process.env.IP);
serverHttp.on('listening', () => console.info(`Notes App running at http://${process.env.IP}:${process.env.HTTP_PORT}`));

app.get('/orden/:preferenceId', function (req, res) {
	const preferenceId = req.params.preferenceId;
  
	try {
	  const response =  app.get(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
		headers: {
		  'Authorization': `Bearer ${access_token}`
		}
	  });
  
	  res.json(response.data);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Error al obtener la orden de Mercado Pago' });
	}
  });