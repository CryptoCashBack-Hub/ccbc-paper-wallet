ninja.wallets.singlewallet = {
	open: function () {
		if (document.getElementById("ccbcaddress").innerHTML == "") {
			ninja.wallets.singlewallet.generateNewAddressAndKey();
		}
		document.getElementById("walletCommands").style.display = "block";
		document.getElementById("keyarea").style.display = "block";
		document.getElementById("currencyddl").style.display = "block";
		document.getElementById("singlearea").style.display = "block";
		document.getElementById("initBanner").style.display = "none";
	},

	close: function () {
		document.getElementById("singlearea").style.display = "none";
	},

	// generate cryptocashback address and private key and update information in the HTML
	generateNewAddressAndKey: function () {
		try {
			var key = new CryptoCashBack.ECKey(false);
			var cryptocashbackAddress = key.getCryptoCashBackAddress();
			var privateKeyWif = key.getCryptoCashBackWalletImportFormat();
			document.getElementById("ccbcaddress").innerHTML = cryptocashbackAddress;
			document.getElementById("ccbcprivwif").innerHTML = privateKeyWif;
			var keyValuePair = {
				"qrcode_public": cryptocashbackAddress,
				"qrcode_private": privateKeyWif
			};
			ninja.qrCode.showQrCode(keyValuePair, 4);
		}
		catch (e) {
			// browser does not have sufficient JavaScript support to generate a cryptocashback address
			alert(e);
			document.getElementById("ccbcaddress").innerHTML = "error";
			document.getElementById("ccbcprivwif").innerHTML = "error";
			document.getElementById("qrcode_public").innerHTML = "";
			document.getElementById("qrcode_private").innerHTML = "";
		}
	}
};
