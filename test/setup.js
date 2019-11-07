require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');
const auth = `Bearer ${process.env.API_TOKEN}`;

global.expect = expect;
global.supertest = supertest;
global.auth = auth;
