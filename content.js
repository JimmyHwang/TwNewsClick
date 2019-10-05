//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報"];
var ClipboardBuffer = false;

//-----------------------------------------------------------------------------
// Common functions
//-----------------------------------------------------------------------------
function isset(_var){
  return !!_var; // converting to boolean.
}

function GetMetaData(key1, value1, key2) {
  var result = false;
  var select = sprintf("meta[%s=\"%s\"]", key1, value1);
  try {
    result = document.querySelector(select)[key2];
  } catch (e) {
  }
  return result;
}

//-----------------------------------------------------------------------------
// Page functions
//-----------------------------------------------------------------------------
$(document).ready(function () {
  // $('body').append('<textarea id="test"/>');
  // var $test = $('#test');
  // $test.text('some text which should appear in clipboard');
  // $test.select();
  console.log("@Content:Ready");
  //document.execCommand('copy');
  //alert('copied!');
});

document.addEventListener('copy', function(e) {
  //e.clipboardData.setData('text/html', "2019-01-01, <a href='http://www.google.com'>Google</a>");
  if (ClipboardBuffer !== false) {
    e.clipboardData.setData('text/html', ClipboardBuffer);
    e.preventDefault();
    ClipboardBuffer = false;
  }
});

//-----------------------------------------------------------------------------
// News Site Class Defination
//-----------------------------------------------------------------------------
class 中央通訊社 {
  constructor() {
  }
  
  Test() {
    var st = false;
    var site_name = GetMetaData("itemprop", "author", "content");
    if (site_name == "中央通訊社") {
      st = true;
    }
    return st;
  }

  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[itemprop="author"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[itemprop="datePublished"]')['content'];
    return info;
  }
}

class 經濟日報 {
  constructor() {
  }

  Test() {
    var st = false;
    var site_name = GetMetaData("property", "og:site_name", "content");
    if (site_name == "經濟日報") {
      st = true;
    }
    return st;
  }

  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[property="og:site_name"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[name="date"]')['content'];
    return info;
  }
}

class 中時電子報 {
  constructor() {
  }

  Test() {
    var st = false;
    var site_name = GetMetaData("property", "og:site_name", "content");
    if (site_name == "中時電子報") {
      st = true;
    }
    return st;
  }
  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[property="og:site_name"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[name="pubdate"]')['content'];      
    return info;
  }
}

class 自由電子報 {
  constructor() {
  }
  
  Test() {
    var st = false;
    var site_name = GetMetaData("property", "og:site_name", "content");
    if (site_name == "自由電子報") {
      st = true;
    }
    return st;
  }
  
  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[property="og:site_name"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[name="pubdate"]')['content'];      
    return info;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
  document.execCommand('copy');
  console.log("@Content");
  var info = false;    
  for (let item of NewsSiteList) {
    //console.log(item);
    var nobj = eval("new " + item + "()");
    if (nobj.Test()) {
      info = nobj.GetInfo();
      break;
    }
  } 
  console.log(info);
  if (info !== false) {
    
    ClipboardBuffer = sprintf("%s, <a href='%s'>%s</a>", info.Date, info.URL, info.Title);
    document.execCommand('copy');
  }  
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");  
  if (request.greeting == "hello")
    sendResponse({farewell: "goodbye"});
});