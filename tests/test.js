var superagent = require('superagent');
var assert = require('assert');
var expect = require('expect.js');
var jsdom = require('mocha-jsdom');
var authController = require('../app/authorization/controllers/AuthController.js');

describe('Express rest API test', function() {
    jsdom();
    var user;
    var token;
    var signupUrl = 'http://127.0.0.1:3000/auth/signup';
    var loginUrl = 'http://127.0.0.1:3000/auth/login';
    
    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function parseToken(token){
        var user = {};
        if(token){
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;  
    }
    
    describe('TEST', function () {
        
           it('#SIGNUP', function (done) {
            superagent.post(signupUrl)
                .send({
                    email : 'test@test.com',
                    password : 'testPassword',
                    name : 'tester'
                })
                .end(function(e,res){
                    expect(e).to.eql(null);
                    expect(res.body.type).to.eql(true);
                    token = res.body.data.token;
                    user = parseToken(token);
                    expect(user.email).to.eql('test@test.com');
                    expect(user.role).to.eql('user');
                    expect(user.name).to.eql('tester');
                    done();
                })
        });
        
        it('#LOGIN', function (done) {
            superagent
                .post(loginUrl)
                .send({
                    email : 'test@test.com',
                    password : 'testPassword'
                })
                .end(function(e,res){
                expect(e).to.eql(null);
                expect(res.body.type).to.eql(true);
                token = res.body.data.token;
                user = parseToken(token);
                expect(user.email).to.eql('test@test.com');
                expect(user.role).to.eql('user');
                expect(user.name).to.eql('tester');
                done();
            })
        });
        
        
        it('#DELETE USER', function (done) {
            superagent
                .del(signupUrl)
                .send({
                email : 'test@test.com'
            })
                .end(function(e,res){
                expect(e).to.eql(null);
                expect(res.body.type).to.eql(true);
                expect(res.body.msg).to.eql('user deleted successfully with email ');
                done();
            })
        });
        
    });
});