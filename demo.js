// ==UserScript==
// @name         ポケモンセンター会員登録自動化助手 (增强版)
// @namespace    http://tampermonkey.net/
// @version      4.0-slim
// @description  自动填写会员登录表单（数据由 HTML 注入）
// @author       CHEN BIKUN
// @match        *://www.pokemoncenter-online.com/new-customer/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  console.log('[会員登録助手] 🚀 脚本启动');

  const userData = window.userData || [];

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

    setInputValue(document.getElementById('registration-form-nname'), user.nickname);
    setInputValue(document.getElementById('registration-form-fname'), user.name);
    setInputValue(document.getElementById('registration-form-kana'), user.kana);
    setInputValue(document.getElementById('registration-form-phone'), user.phone);
    setInputValue(document.getElementById('registration-form-postcode'), user.postal);
    setInputValue(document.getElementById('registration-form-address-line1'), user.addressFull);
    setInputValue(document.getElementById('registration-form-address-line2'), user.myAddress2);

    const yearSelect = document.getElementById('registration-form-birthdayyear');
    const monthSelect = document.getElementById('registration-form-birthdaymonth');
    const daySelect = document.getElementById('registration-form-birthdayday');

    setSelectValue(yearSelect, user.birthday.slice(0, 4));
    setSelectValue(monthSelect, user.birthday.slice(4, 6));
    setSelectValue(daySelect, user.birthday.slice(6, 8));

    const genderSelect = document.querySelector('select[name="dwfrm_profile_customer_gender"]');
    setSelectValue(genderSelect, user.gender || '9');

    const pass1 = document.querySelector('input[name="dwfrm_profile_login_password"]');
    const pass2 = document.querySelector('input[name="dwfrm_profile_login_passwordconfirm"]');
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
      padding: '10px 20px', background: '#4caf50', color: '#fff', borderRadius: '8px', border: 'none',
      fontSize: '16px', cursor: 'pointer'
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