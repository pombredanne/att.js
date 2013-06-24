module('wcg.phonedial');

test("Basic init and event tests for WCG plugin: make a call", function () {
    // how many assertions to expect
    var client_id = "bnaetrgxhg1hwcqqgczteolaokbugmvg";
    var redirect_uri = "http://localhost/testing";
    var nb_to_dial = '1-804-222-1111';
    //N.B.: Before running this test, make sure that index.html page is located under http://localhost/testing.
    //If not, change the client_id and the redirect_uri accordingly.
    expect(10);

    att = new ATT({
        clientID: client_id,
        scope: 'profile,webrtc',
        redirectURI: redirect_uri,
        server: "alpha1"
    });
    ok(att, "att is instantiated");


    //before starting the test, make sure we have the access token.
    //
    var oauthParams = {},
        regex = /([^&=]+)=([^&]*)/g,
        m;
    while (m = regex.exec(location.hash.substring(1))) {
        oauthParams[decodeURIComponent(m[1].replace(/^\//, ''))] = decodeURIComponent(m[2]);
    }


    if (oauthParams['access_token']) {
        stop();
        att.oauth2.login(function me() {
        });

        att.on("phoneReady", function () {
            //check if user has been registered
            ok("phoneReady", "Phone is ready");
            ok(att.wcgBackend.wcgService._sessionID, "User has a session id: registered");
            //make a call to a test number that automatically reads your phone number and ends the call: callBegin should be raised.
            att.dial(nb_to_dial);

        });

        att.on("ring", function (call) {
            ok("ring", "Phone has rung");
        });

        att.on("outgoingCall", function (call) {
            ok("outgoingCall", "Number has been dialed");
            var numberToMatch = call.remotePeer.match(/sip\:([^@]*)@/);
            var number = numberToMatch ? numberToMatch[1] : null;
            equal(number, ATT.phoneNumber.parse(nb_to_dial), "Dialed number: " + number);

        });


        att.on("callBegin", function (call) {
            ok("callBegin", "Call has begun");
        });

        att.on("callEnd", function (call) {
            ok("callEnd", "Call has ended");
            att.logout();
        });

        att.on("phoneClose", function () {
            ok("phoneClose", "Phone is close");
            //check if user has logged out
            equal(att.wcgBackend.wcgService, null, "User has logged out");
            start();
        });

        att.on("callError", function (call) {
            ok(false, "this should not happen");

        });

        att.on("phoneError", function () {
            ok(false, "this should not happen");

        });

    }
    else {
        window.location.href = att.oauth2.authorizeURL();
    }


});
