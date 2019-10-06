//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報", "TechNews", "ETtoday", "NowNews", "BusinessToday", "工商時報", 
                    "財訊", "TVBS"];
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
class NewsBaseClass {
  constructor() {
    this.site_name = false;          // TVBS
    this.domain_name = false;        // tvbs.com.tw
    this.title_break = "|";
    this.date_attribute_key = "property";
    this.date_attribute_value = "article:published_time";    
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
    info.Site = GetMetaData("property", "og:site_name", "content");
    if (info.Site == false) {
      info.Site = this.site_name;
    }
    info.Title = GetMetaData("property", "og:title", "content");
    info.URL = GetMetaData("property", "og:url", "content");
    info.Date = GetMetaData(this.date_attribute_key, this.date_attribute_value, "content");    
    if (info.Date != false) {
      info.Date = NormalizeDateString(info.Date);
    }
    info.Title = NormalizeTitleString(info.Title, this.title_break);
    return info;
  }
}

class 中央通訊社 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中央通訊社";
    this.domain_name = "cna.com.tw";
    this.title_break = "|";
    this.date_attribute_key = "itemprop";
    this.date_attribute_value = "datePublished"; 
  }
}

class 經濟日報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "經濟日報";
    this.domain_name = "money.udn.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "date"; 
  }
}

class 中時電子報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中時電子報";
    this.domain_name = "chinatimes.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class 自由電子報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "自由電子報";
    this.domain_name = "ltn.com.tw";    
    this.title_break = "-";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class TechNews extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "TechNews 科技新報";
    this.domain_name = "technews.tw";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var url = info.URL;
    var tag = this.domain_name;
    var p1 = url.indexOf(tag)+tag.length+1;
    info.Date = url.substring(p1, p1+10); 
    info.Date = NormalizeDateString(info.Date);
    return info;
  }
}

class ETtoday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "ETtoday 新聞雲";
    this.domain_name = "ettoday.net";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class NowNews extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "NowNews 今日新聞";
    this.domain_name = "nownews.com";
    this.date_attribute_key = "name";
    this.date_attribute_value = "publishedTime"; 
  }
}

class BusinessToday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "今周刊";
    this.domain_name = "businesstoday.com.tw";
    this.title_break = "-";
  }
}

class 工商時報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "工商時報";
    this.domain_name = "ctee.com.tw";
    this.title_break = "-";
  }
}

class 財訊 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "財訊";
    this.domain_name = "wealth.com.tw";
    this.title_break = "-";
  }
}

class TVBS extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "TVBS";
    this.domain_name = "tvbs.com.tw";
    this.title_break = "│";
  }
}

//-----------------------------------------------------------------------------
// Message Receiver
//-----------------------------------------------------------------------------
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