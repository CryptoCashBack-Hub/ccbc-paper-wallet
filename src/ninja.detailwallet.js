ninja.wallets.detailwallet = {
	qrscanner: {
		scanner: null,

		start: function() {
			document.getElementById('paperqrscanner').className = 'show';
			ninja.wallets.detailwallet.qrscanner.showError(null);
			var supported = ninja.wallets.detailwallet.qrscanner.scanner.isSupported();
			if (!supported) {
				document.getElementById('paperqrnotsupported').className = '';
			} else {
				ninja.wallets.detailwallet.qrscanner.scanner.start();
			}
		},

		stop: function() {
			ninja.wallets.detailwallet.qrscanner.scanner.stop();
			document.getElementById('paperqrscanner').className = '';
		},

		showError: function(error) {
			if (error) {
				if (error == 'PERMISSION_DENIED' || error == 'PermissionDeniedError') {
					document.getElementById('paperqrerror').innerHTML = '';
					document.getElementById('paperqrpermissiondenied').className = '';
				} else {
					document.getElementById('paperqrerror').innerHTML = error;
					document.getElementById('paperqrpermissiondenied').className = 'hide';
				}
			} else {
				document.getElementById('paperqrerror').innerHTML = '';
				document.getElementById('paperqrpermissiondenied').className = 'hide';
			}
		}
	},

	open: function () {
		document.getElementById("detailarea").style.display = "block";
		document.getElementById("detailprivkey").focus();
		if (!ninja.wallets.detailwallet.qrscanner.scanner) {
			ninja.wallets.detailwallet.qrscanner.scanner = new QRCodeScanner(320, 240, 'paperqroutput',
				function(data) {
					document.getElementById('detailprivkey').value = data;
					document.getElementById('paperqrscanner').className = '';
					ninja.wallets.detailwallet.viewDetails();
				},
				function(error) {
					ninja.wallets.detailwallet.qrscanner.showError(error);
				});
		}
	},

	close: function () {
		document.getElementById("detailarea").style.display = "none";
	},

	openCloseFaq: function (faqNum) {
		// do close
		if (document.getElementById("detaila" + faqNum).style.display == "block") {
			document.getElementById("detaila" + faqNum).style.display = "none";
			document.getElementById("detaile" + faqNum).setAttribute("class", "more");
		}
		// do open
		else {
			document.getElementById("detaila" + faqNum).style.display = "block";
			document.getElementById("detaile" + faqNum).setAttribute("class", "less");
		}
	},

	viewDetails: function () {
		var bip38 = false;
		var key = document.getElementById("detailprivkey").value.toString().replace(/^\s+|\s+$/g, ""); // trim white space
		document.getElementById("detailprivkey").value = key;
		var bip38CommandDisplay = document.getElementById("detailbip38commands").style.display;
		ninja.wallets.detailwallet.clear();
		if (key == "") {
			return;
		}
		if (ninja.privateKey.isBIP38Format(key)) {
			document.getElementById("detailbip38commands").style.display = bip38CommandDisplay;
			if (bip38CommandDisplay != "block") {
				document.getElementById("detailbip38commands").style.display = "block";
				document.getElementById("detailprivkeypassphrase").focus();
				return;
			}
			var passphrase = document.getElementById("detailprivkeypassphrase").value.toString().replace(/^\s+|\s+$/g, ""); // trim white space
			if (passphrase == "") {
				alert(ninja.translator.get("bip38alertpassphraserequired"));
				return;
			}
			document.getElementById("busyblock").className = "busy";
			// show Private Key BIP38 Format
			document.getElementById("detailprivbip38").innerHTML = key;
			document.getElementById("detailbip38").style.display = "block";
			ninja.privateKey.BIP38EncryptedKeyToByteArrayAsync(key, passphrase, function (ccbcKeyOrError) {
				document.getElementById("busyblock").className = "";
				if (ccbcKeyOrError.message) {
					alert(ccbcKeyOrError.message);
					ninja.wallets.detailwallet.clear();
				} else {
					ninja.wallets.detailwallet.populateKeyDetails(new CryptoCashBack.ECKey(ccbcKeyOrError));
				}
			});
		}
		else {
			if (CryptoCashBack.ECKey.isMiniFormat(key)) {
				// show Private Key Mini Format
				document.getElementById("detailprivmini").innerHTML = key;
				document.getElementById("detailmini").style.display = "block";
			}
			else if (CryptoCashBack.ECKey.isBase6Format(key)) {
				// show Private Key Base6 Format
				document.getElementById("detailprivb6").innerHTML = key;
				document.getElementById("detailb6").style.display = "block";
			}
			var ccbcKey = new CryptoCashBack.ECKey(key);
			if (ccbcKey.priv == null) {
				// enforce a minimum passphrase length
				if (key.length >= ninja.wallets.brainwallet.minPassphraseLength) {
					// Deterministic Wallet confirm box to ask if user wants to SHA256 the input to get a private key
					var usePassphrase = confirm(ninja.translator.get("detailconfirmsha256"));
					if (usePassphrase) {
						var bytes = Crypto.SHA256(key, { asBytes: true });
						var ccbcKey = new CryptoCashBack.ECKey(bytes);
					}
					else {
						ninja.wallets.detailwallet.clear();
					}
				}
				else {
					alert(ninja.translator.get("detailalertnotvalidprivatekey"));
					ninja.wallets.detailwallet.clear();
				}
			}
			ninja.wallets.detailwallet.populateKeyDetails(ccbcKey);
		}
	},

	populateKeyDetails: function (ccbcKey) {
		if (ccbcKey.priv != null) {
			ccbcKey.setCompressed(false);
			document.getElementById("detailprivhex").innerHTML = ccbcKey.toString().toUpperCase();
			document.getElementById("detailprivb64").innerHTML = ccbcKey.toString("base64");
			var cryptocashbackAddress = ccbcKey.getCryptoCashBackAddress();
			var wif = ccbcKey.getCryptoCashBackWalletImportFormat();
			document.getElementById("detailpubkey").innerHTML = ccbcKey.getPubKeyHex();
			document.getElementById("detailaddress").innerHTML = cryptocashbackAddress;
			document.getElementById("detailprivwif").innerHTML = wif;
			ccbcKey.setCompressed(true);
			var cryptocashbackAddressComp = ccbcKey.getCryptoCashBackAddress();
			var wifComp = ccbcKey.getCryptoCashBackWalletImportFormat();
			document.getElementById("detailpubkeycomp").innerHTML = ccbcKey.getPubKeyHex();
			document.getElementById("detailaddresscomp").innerHTML = cryptocashbackAddressComp;
			document.getElementById("detailprivwifcomp").innerHTML = wifComp;

			ninja.qrCode.showQrCode({
				"detailqrcodepublic": cryptocashbackAddress,
				"detailqrcodepubliccomp": cryptocashbackAddressComp,
				"detailqrcodeprivate": wif,
				"detailqrcodeprivatecomp": wifComp
			}, 4);
		}
	},

	clear: function () {
		document.getElementById("detailpubkey").innerHTML = "";
		document.getElementById("detailpubkeycomp").innerHTML = "";
		document.getElementById("detailaddress").innerHTML = "";
		document.getElementById("detailaddresscomp").innerHTML = "";
		document.getElementById("detailprivwif").innerHTML = "";
		document.getElementById("detailprivwifcomp").innerHTML = "";
		document.getElementById("detailprivhex").innerHTML = "";
		document.getElementById("detailprivb64").innerHTML = "";
		document.getElementById("detailprivb6").innerHTML = "";
		document.getElementById("detailprivmini").innerHTML = "";
		document.getElementById("detailprivbip38").innerHTML = "";
		document.getElementById("detailqrcodepublic").innerHTML = "";
		document.getElementById("detailqrcodepubliccomp").innerHTML = "";
		document.getElementById("detailqrcodeprivate").innerHTML = "";
		document.getElementById("detailqrcodeprivatecomp").innerHTML = "";
		document.getElementById("detailb6").style.display = "none";
		document.getElementById("detailmini").style.display = "none";
		document.getElementById("detailbip38commands").style.display = "none";
		document.getElementById("detailbip38").style.display = "none";
	}
};
