// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let eDateTitle = document.getElementById('id_date_title');
let eOnlyTitle = document.getElementById('id_only_title');
let eUpdate = document.getElementById('id_update');

//-----------------------------------------------------------------------------
// Override console.log through background page
//-----------------------------------------------------------------------------
function console () {
}

console.log = function(msg) {
  var bg = chrome.extension.getBackgroundPage();   // console of Background Page 
  if (bg != null) {
    bg.console.log(msg);
  }
};

//-----------------------------------------------------------------------------
// Startup
//-----------------------------------------------------------------------------
console.log("@Popup:Loading");

eDateTitle.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {greeting: "hello", mode: 0}, function(response) {
      console.log(response);
    });
  });
};

eOnlyTitle.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {greeting: "hello", mode: 1}, function(response) {
      console.log(response);
    });
  });
};

eUpdate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {greeting: "hello", mode: 2}, function(response) {
      console.log(response);
    });
  });
};
