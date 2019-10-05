//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報", "TechNews", "ETtoday", "NowNews", "BusinessToday"];
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

function NormalizeDateString(tstr) {
  var result = tstr;
  var p = tstr.indexOf(" ");
  if (p == -1) {
    var p = tstr.indexOf("T");
  }
  if (p != -1) {
    result = tstr.substring(0, p);
  }
  result = result.replace(/\//g, "-");
  return result;
}

function NormalizeTitleString(tstr, tag = "|") {
  var tlist = tstr.split(tag);
  result = tlist[0].trim();
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
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title, "|");
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
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title);
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
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title);
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
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title, "-");
    return info;
  }
}

class TechNews {
  constructor() {
    this.domain_name = "technews.tw";
  }
  
  Test() {
    var st = false;
    var url = window.location.href;
    if (url.indexOf(this.domain_name) != -1) {
      st = true;
    }
    return st;
  }
  
  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[property="og:site_name"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    var url = info.URL;
    var tag = this.domain_name;
    var p1 = url.indexOf(tag)+tag.length+1;
    info.Date = url.substring(p1, p1+10); 
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title);
    return info;
  }
}

class ETtoday {
  constructor() {
    this.domain_name = "ettoday.net";
  }
  
  Test() {
    var st = false;
    var url = window.location.href;
    if (url.indexOf(this.domain_name) != -1) {
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
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title);
    return info;
  }
}

class NowNews {
  constructor() {
    this.domain_name = "nownews.com";
  }
  
  Test() {
    var st = false;
    var url = window.location.href;
    if (url.indexOf(this.domain_name) != -1) {
      st = true;
    }
    return st;
  }

  GetInfo() {
    var info = {};  
    info.Site = document.querySelector('meta[property="og:site_name"]')['content'];
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[name="publishedTime"]')['content'];      
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title);
    return info;
  }
}

class BusinessToday {
  constructor() {
    this.domain_name = "businesstoday.com.tw";
  }
  
  Test() {
    var st = false;
    var url = window.location.href;
    if (url.indexOf(this.domain_name) != -1) {
      st = true;
    }
    return st;
  }

  GetInfo() {
    var info = {};  
    info.Site = "今周刊";
    info.Title = document.querySelector('meta[property="og:title"]')['content'];
    info.URL = document.querySelector('meta[property="og:url"]')['content'];
    info.Date = document.querySelector('meta[property="article:published_time"]')['content'];   
    info.Date = NormalizeDateString(info.Date);
    info.Title = NormalizeTitleString(info.Title, "-");
    return info;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
  //
  // Get Information from News Class
  //
  var info = false;    
  for (let item of NewsSiteList) {
    var nobj = eval("new " + item + "()");
    if (nobj.Test()) {
      info = nobj.GetInfo();
      break;
    }
  } 
  //
  // Generate HTML formated data then set to clipboard
  //
  if (info !== false) {    
    ClipboardBuffer = sprintf("%s, <a href='%s'>%s</a>", info.Date, info.URL, info.Title);
    document.execCommand('copy');
  }  
  //
  // Sample Code
  //
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");  
  if (request.greeting == "hello") {
    sendResponse({farewell: "goodbye", info: info});
  }    
});