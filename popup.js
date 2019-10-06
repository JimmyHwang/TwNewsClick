// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let eChangeColor = document.getElementById('id_change_color');
let eClipboard = document.getElementById('id_clipboard');

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

eClipboard.onclick = function(element) {
  console.log("@eClipboard");
  //document.execCommand('copy');
  // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    // console.log("@sendMessage");
    // console.log(response);
  // });
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("@eClipboard2");
    
    var tab = tabs[0];
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
      console.log(response);
      //console.log(response.farewell);
    });
  });
};
