// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let eDateTitle = document.getElementById('id_date_title');
let eOnlyTitle = document.getElementById('id_only_title');
//let eChangeColor = document.getElementById('id_change_color');

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

/*
chrome.storage.sync.get('color', function(data) {
  eChangeColor.style.backgroundColor = data.color;
  eChangeColor.setAttribute('value', data.color);
});

eChangeColor.onclick = function(element) {
  console.log("@eChangeColor");   
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: 'document.body.style.backgroundColor = "' + color + '";'}
    );
  });
};
*/

eDateTitle.onclick = function(element) {
  console.log("@date_title");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("@date_title2");    
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {greeting: "hello", mode: 0}, function(response) {
      console.log(response);
    });
  });
};

eOnlyTitle.onclick = function(element) {
  console.log("@only_title");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("@only_title2");    
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {greeting: "hello", mode: 1}, function(response) {
      console.log(response);
    });
  });
};
