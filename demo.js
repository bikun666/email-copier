// ==UserScript==
// @name         ポケモンセンター会員登録自動化助手 (增强版)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  自动填写会员登录表单 - 由 HTML 注入数据
// @author       CHEN BIKUN
// @match        *://www.pokemoncenter-online.com/new-customer/*
// @grant        none
// ==/UserScript==

const userData = __USER_DATA_REPLACE__;

(function () {
    'use strict';

    // 生成随机字符串
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    // 生成随机电话号码
    function generateRandomPhone() {
        const prefix = ['070', '080', '090'][Math.floor(Math.random() * 3)];
        return prefix + Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
    }

    // 地址转换函数
    function addressChange(address) {
        const toFullWidthNumber = (num) => num.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFF10 - 0x30));
        const toKanjiNumber = (num) => {
            const kanjiDigits = ['〇','一','二','三','四','五','六','七','八','九'];
            const n = parseInt(num, 10);
            if (isNaN(n)) return num;
            if (n <= 10) return kanjiDigits[n];
            return num.split('').map(d => kanjiDigits[parseInt(d)]).join('');
        };

        const [chome, ban, go] = address.split(/[-ー−]/);
        if ([chome, ban, go].includes(undefined)) return address;

        const chomeVariants = [
            chome + "丁目",
            toFullWidthNumber(chome) + "ちょうめ",
            toFullWidthNumber(chome) + "チョウメ",
            toKanjiNumber(chome) + "丁目"
        ];
        const banVariants = [
            ban + "番",
            toFullWidthNumber(ban) + "ばん",
            toFullWidthNumber(ban) + "バン",
            toKanjiNumber(ban) + "番"
        ];
        const goVariants = [
            go + "号",
            toFullWidthNumber(go) + "ごう",
            toFullWidthNumber(go) + "ゴウ",
            toKanjiNumber(go) + "号"
        ];

        while (true) {
            const chomeStr = chomeVariants[Math.floor(Math.random() * chomeVariants.length)];
            const banStr = banVariants[Math.floor(Math.random() * banVariants.length)];
            const goStr = goVariants[Math.floor(Math.random() * goVariants.length)];
            const useDash1 = Math.random() < 0.5;
            const useDash2 = Math.random() < 0.5;
            if (useDash1 && banStr === "一番") continue;
            if (useDash2 && goStr === "一号") continue;
            return chomeStr + (useDash1 ? "-" : "") + banStr + (useDash2 ? "-" : "") + goStr;
        }
    }

    function setInputValue(el, val) {
        if (!el) return;
        el.value = val;
        ['input', 'change', 'blur'].forEach(event => el.dispatchEvent(new Event(event, { bubbles: true })));
    }

    function setSelectValue(el, val) {
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setCheckbox(el, checked = true) {
        if (!el || el.checked === checked) return;
        el.checked = checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function findUserByEmail(email) {
        return userData.find(u => u.email === email);
    }

    async function autoFillForm() {
        const emailInput = document.querySelector('input[type="email"]');
        if (!emailInput || !emailInput.value) return;

        const user = findUserByEmail(emailInput.value);
        if (!user) {
            console.warn("未找到匹配的 userData");
            return;
        }

        const name = user.name || "";
        const kana = user.kana || "";
        const birthday = user.birthday || "19900101";
        const phone = user.phone || generateRandomPhone();
        const postal = user.postal || "100-0001";
        const rowpassword = user.rowpassword || "Abc1234.";
        const address1 = user.myAddress1 ? addressChange(user.myAddress1) : "1丁目1番1号";
        const address2 = user.myAddress2 || "";
        const gender = user.gender || "9";

        const nickname = generateRandomString(5);
        setInputValue(document.getElementById('registration-form-nname'), nickname);
        setInputValue(document.getElementById('registration-form-fname'), name);
        setInputValue(document.getElementById('registration-form-kana'), kana);
        setSelectValue(document.getElementById('registration-form-birthdayyear'), birthday.slice(0, 4));
        setSelectValue(document.getElementById('registration-form-birthdaymonth'), birthday.slice(4, 6));
        setSelectValue(document.getElementById('registration-form-birthdayday'), birthday.slice(6, 8));
        setInputValue(document.getElementById('registration-form-phone'), phone);
        setInputValue(document.getElementById('registration-form-address-line1'), address1);
        setInputValue(document.getElementById('registration-form-address-line2'), address2);
        setSelectValue(document.querySelector('select[name="dwfrm_profile_customer_gender"]'), gender);
        setInputValue(document.getElementById('registration-form-postcode'), postal);
        setInputValue(document.querySelector('input[name="dwfrm_profile_login_password"]'), rowpassword);
        setInputValue(document.querySelector('input[name="dwfrm_profile_login_passwordconfirm"]'), rowpassword);
        setCheckbox(document.getElementById('terms'), true);
        setCheckbox(document.getElementById('privacyPolicy'), true);

        console.log("[注册助手] 填充完成！");
    }

    function init() {
        const fillBtn = document.createElement('button');
        fillBtn.textContent = "🚀 自动填表";
        fillBtn.style.cssText = `
            position: fixed; top: 50%; left: 20px; transform: translateY(-50%);
            background: linear-gradient(to right, #ff416c, #ff4b2b);
            color: #fff; padding: 10px 20px; border: none;
            font-size: 18px; font-weight: bold; border-radius: 10px;
            box-shadow: 0 0 20px #ff4b2b; cursor: pointer; z-index: 99999;
        `;
        fillBtn.onclick = () => autoFillForm();
        document.body.appendChild(fillBtn);
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

})();