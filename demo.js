// ==UserScript==
// @name         ポケモンセンター会員登録自動化助手 (精简版)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  自动填写注册表单（来自HTML注入userData）
// @match        *://www.pokemoncenter-online.com/new-customer/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // USERDATA_START
  const userData = [];
  // USERDATA_END

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const setInputValue = (el, val) => {
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  const setSelectValue = (el, val) => {
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const setCheckbox = (el, checked = true) => {
    if (el && el.checked !== checked) {
      el.checked = checked;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const setRadio = (value) => {
    const radios = document.querySelectorAll(`input[type="radio"][value="${value}"]`);
    radios.forEach(radio => {
      if (!radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  };

  const findUserByEmail = (email) => userData.find(u => u.email === email);

  async function autoFillForm() {
    const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name*="email"]');
    if (!emailInput || !emailInput.value) return;
    const user = findUserByEmail(emailInput.value);
    if (!user) return;

    setInputValue(document.getElementById('registration-form-nname'), user.nickname || generateRandomString(5));
    setInputValue(document.getElementById('registration-form-fname'), user.name);
    setInputValue(document.getElementById('registration-form-kana'), user.kana);
    setSelectValue(document.getElementById('registration-form-birthdayyear'), String(user.birthday).slice(0, 4));
    setSelectValue(document.getElementById('registration-form-birthdaymonth'), String(user.birthday).slice(4, 6));
    setSelectValue(document.getElementById('registration-form-birthdayday'), String(user.birthday).slice(6, 8));
    setInputValue(document.getElementById('registration-form-phone'), user.phone);
    setSelectValue(document.querySelector('select[name="dwfrm_profile_customer_gender"]'), user.gender);
    setInputValue(document.getElementById('registration-form-address-line1'), user.myAddress);
    setInputValue(document.getElementById('registration-form-address-line2'), user.myAddress);
    setInputValue(document.getElementById('registration-form-postcode'), user.postal);
    setInputValue(document.querySelector('input[name="dwfrm_profile_login_password"]'), user.rowpassword);
    setInputValue(document.querySelector('input[name="dwfrm_profile_login_passwordconfirm"]'), user.rowpassword);
    setRadio('false');
    setCheckbox(document.getElementById('terms'), true);
    setCheckbox(document.getElementById('privacyPolicy'), true);
  }

  function init() {
    const btn = document.createElement('button');
    btn.textContent = '🚀 填表';
    Object.assign(btn.style, {
      position: 'fixed', top: '50%', left: '10px', transform: 'translateY(-50%)',
      zIndex: 9999, padding: '10px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px',
      fontWeight: 'bold', cursor: 'pointer'
    });
    btn.onclick = autoFillForm;
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
