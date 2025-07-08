// ==UserScript==
// @name         ポケモンセンター会員登録自動化助手 (增强版)
// @namespace    http://tampermonkey.net/
// @version      4.0-slim
// @description  自动填写会员登录表单
// @author       CHEN BIKUN
// @match        *://www.pokemoncenter-online.com/new-customer/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  console.log('[会員登録助手] 🚀 脚本启动');

  const userData = window.userData || [];

  function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => chars[Math.random() * chars.length | 0]).join('');
  }

  function generateRandomPhone() {
    const prefix = ['070', '080', '090'][Math.floor(Math.random() * 3)];
    let phone = prefix;
    for (let i = 0; i < 8; i++) phone += Math.floor(Math.random() * 10);
    return phone;
  }

  function setInputValue(el, val) {
    if (!el) return false;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  function setSelectValue(el, val) {
    if (!el) return false;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function setCheckbox(el, checked = true) {
    if (!el || el.checked === checked) return false;
    el.checked = checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function findUserByEmail(email) {
    return userData.find(u => u.email === email);
  }

  async function autoFillForm() {
    const emailInput = document.querySelector('input[type="email"]') || document.getElementById('registration-form-email');
    if (!emailInput || !emailInput.value) return;

    const user = findUserByEmail(emailInput.value);
    if (!user) return;

    const nameInput = document.getElementById('registration-form-fname');
    const kanaInput = document.getElementById('registration-form-kana');
    const phoneInput = document.getElementById('registration-form-phone');
    const yearSelect = document.getElementById('registration-form-birthdayyear');
    const monthSelect = document.getElementById('registration-form-birthdaymonth');
    const daySelect = document.getElementById('registration-form-birthdayday');
    const genderSelect = document.querySelector('select[name="dwfrm_profile_customer_gender"]');
    const postalInput = document.getElementById('registration-form-postcode');
    const address1 = document.getElementById('registration-form-address-line1');
    const address2 = document.getElementById('registration-form-address-line2');
    const pass1 = document.querySelector('input[name="dwfrm_profile_login_password"]');
    const pass2 = document.querySelector('input[name="dwfrm_profile_login_passwordconfirm"]');
    const nicknameInput = document.getElementById('registration-form-nname');

    setInputValue(nicknameInput, generateRandomString(5));
    setInputValue(nameInput, user.name);
    setInputValue(kanaInput, user.kana);
    setInputValue(phoneInput, user.phone || generateRandomPhone());
    setInputValue(postalInput, user.postal);
    setSelectValue(yearSelect, user.birthday.slice(0, 4));
    setSelectValue(monthSelect, user.birthday.slice(4, 6));
    setSelectValue(daySelect, user.birthday.slice(6, 8));
    setSelectValue(genderSelect, user.gender || '9');
    setInputValue(address1, user.myAddress1 + ' ' + user.myAddress2);
    setInputValue(address2, user.myAddress2);
    setInputValue(pass1, user.rowpassword);
    setInputValue(pass2, user.rowpassword);
    setCheckbox(document.getElementById('terms'), true);
    setCheckbox(document.getElementById('privacyPolicy'), true);
  }

  function injectButton() {
    const btn = document.createElement('button');
    btn.textContent = '🚀 自动填充';
    Object.assign(btn.style, {
      position: 'fixed', top: '40%', left: '20px', zIndex: 9999,
      padding: '10px 20px', background: '#4caf50', color: '#fff', borderRadius: '8px', border: 'none'
    });
    btn.onclick = autoFillForm;
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
