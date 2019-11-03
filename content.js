//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報", "TechNews", "ETtoday", "NowNews", "BusinessToday", "工商時報", 
                    "財訊", "TVBS", "COOL3C", "UDN", "CNYES", "CMoney", "Storm", "SETN", "BuzzOrange", "NewTalk", "BusinessWeekly", 
                    "中廣新聞網", "AppleDaily", "NextMag", "MoneyDJ", "BusinessNext", "IThome", "T客邦", "立場新聞", "xfastest", "東森新聞",
                    "ManagerToday", "必聞網", "科技產業資訊室", "Yahoo股市", "Yahoo新聞", "MSN財經", "LEDInside", "EETTaiwan"];
var ClipboardBuffer = false;
var DebugFlags = 0;

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
  result = result.replace(/\./g, "-");
  return result;
}

function NormalizeTitleString(tstr, tag = "|") {
  var tlist = tstr.split(tag);
  result = tlist[0].trim();
  return result;
}

//
// The function for fix "\n" exists in data cause json decode failed issue
//
function FixInvalidCharacterInJson(html) {
  var i = 0;
  var offset = 0;
  var t1;
  var t2;
  var data;
  
  do { 
    t1 = html.indexOf('"', offset);
    if (t1 == -1) {
      break;
    }
    t2 = html.indexOf('"', t1+1);
    if (t2 == -1) {
      break;
    }
    var data = html.substring(t1+1, t2);
    if (data.indexOf("\n") != -1) {
      var l1 = data.length;
      data = data.replace("\n", "<br>");
      var l2 = data.length;
      var s1 = html.substring(0, t1+1);
      var s3 = html.substring(t2);
      html = s1+data+s3;
      t2 += l2 - l1;
    }
    offset = t2 + 1;
  } while (true);
  
  return html;
}

class LdJsonClass {
  constructor() {
    this.Object = false;
    var items = document.getElementsByTagName("script");
    var jobj;
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      var type = item.getAttribute('type');
      if (type != null) {
        if (type.indexOf("json") != -1) {   // <script type="application/ld+json">
          var html = FixInvalidCharacterInJson(item.innerHTML);
          try {
            jobj = JSON.parse(html);
          } catch(e) {
            console.log("html="+html);
            jobj = {};
          }          
          if (isset(jobj.datePublished)) {
            this.Object = jobj;
            break;
          }
        }
      }
    }
  }
  
  GetDate() {
    var result = false;
    if (this.Object !== false) {
      result = this.Object.datePublished;
    }
    return result;
  }
}

function GetDateFromLdJson() {
  var jobj = new LdJsonClass();
  return jobj.GetDate();
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
    var domain_list = this.domain_name.split("|");
    for (var i=0; i<domain_list.length; i++) {
      var domain_name = domain_list[i];
      if (url.indexOf(domain_name) != -1) {
        st = true;
        break;
      }      
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
    if (info.Date == false) {
      info.Date = GetMetaData("itemprop", "datePublished", "content");
    }
    if (info.Date == false) {
      info.Date = GetMetaData("name", "date", "content");
    }
    if (info.Date == false) {
      info.Date = GetMetaData("name", "pubdate", "content");
    }
    if (info.Date == false) {
      info.Date = GetDateFromLdJson();
    }
    if (info.Date != false) {
      info.Date = NormalizeDateString(info.Date);
    }
    if (info.Title != false) {
      info.Title = NormalizeTitleString(info.Title, this.title_break);
    }
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

class COOL3C extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "癮科技 Cool3C";
    this.domain_name = "cool3c.com";
    this.title_break = "-";
  }
}

class UDN extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "聯合新聞網";
    this.domain_name = "https://udn.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "date"; 
  }
}

class CNYES extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "鉅亨網";
    this.domain_name = "news.cnyes.com";
    this.title_break = "|";
  }
}

class CMoney extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "CMoney 投資網誌";
    this.domain_name = "cmoney.tw";
  }
}

class Storm extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "風傳媒";
    this.domain_name = "storm.mg";
    this.title_break = "-";
  }
}

class SETN extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "三立新聞網";
    this.domain_name = "setn.com";
  }
}

class BuzzOrange extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "科技報橘";
    this.domain_name = "buzzorange.com";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                //<time class="entry-date published" datetime="2019-09-05T11:00:01+08:00">2019/09/05</time>
    var time_list = document.getElementsByTagName("time");
    for(var i=0; i<time_list.length; i++) {
      var item = time_list[i];
      var html = item.innerHTML;
      var datetime = item.getAttribute('datetime');
      if (datetime != null) {
        date_string = html;
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class NewTalk extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "新頭殼";
    this.domain_name = "newtalk.tw";
  }
}

class BusinessWeekly extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "商周";
    this.domain_name = "businessweekly.com.tw";
  }
  
  GetInfo() {
    var tag = "更新時間：";
    var info = super.GetInfo();
    var date_string = false;
    var span_list = document.getElementsByTagName("span");
    for(var i=0; i<span_list.length; i++) {
      var item = span_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      var p = html.indexOf(tag);
      if (p != -1) {                    // <span class='writter'>撰文者：恩汎理財投資團隊　更新時間：2016-11-17</span>
        p +=  tag.length;
        html = html.substr(p);
        info.Title = info.Title.replace(" - Smart自學網","");
      }      
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      html = html.replace(".", "-");
      if (html.indexOf("-") != -1 && html.length <= 10 && year > 1911) {
        date_string = html; 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class 中廣新聞網 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中廣新聞網";
    this.domain_name = "bcc.com.tw";
  }

  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                // <div class="tt27">2019/07/24 11:22 報導</div>
    var div_list = document.getElementsByTagName("div");
    for(var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("/") != -1 && html.length <= 20 && year > 1911) {
        date_string = html.substring(0, 10); 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class AppleDaily extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "蘋果日報";
    this.domain_name = "tw.appledaily.com";
    this.title_break = "｜";    
  }

  GetInfo() {
    var info = super.GetInfo();
    var date_string = GetDateFromLdJson();
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class NextMag extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "壹週刊";
    this.domain_name = "nextmag.com.tw";
  }
}

class MoneyDJ extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "MoneyDJ 理財網";
    this.domain_name = "moneydj.com";
    this.title_break = "-";
  }
}

class BusinessNext extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "數位時代";
    this.domain_name = "bnext.com.tw";
    this.title_break = "｜";
  }
}

class IThome extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "IThome";
    this.domain_name = "ithome.com.tw";
    this.title_break = "｜";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;
    var items = document.getElementsByTagName("span");
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      if (html.indexOf("-") != -1 && html.length <= 10 && year > 1911) {
        date_string = html; 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class T客邦 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "T客邦";
    this.domain_name = "techbang.com";
  }
}

class 立場新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "立場新聞";
    this.domain_name = "thestandnews.com";
  }
}

class xfastest extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "xfastest";
    this.domain_name = "xfastest.com";    
  }
}

class 東森新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "東森新聞";
    this.domain_name = "ebc.net.tw";    
  }
}

class ManagerToday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "經理人";
    this.domain_name = "managertoday.com.tw";    
  }
  
  GetInfo() {
    var info = super.GetInfo();
    if (info.Date == false) {
      info.Date = GetMetaData("property", "article:published_time", "content");   // Why get failed when exists
      if (info.Date == false) {
        info.Date = GetMetaData("name", "my:date", "content");   
      }
    }    
    return info;
  }
}

class 必聞網 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "必聞網";
    this.domain_name = "biwennews.com";    
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                // <time datetime="2019-08-14 01:19:00">2019-08-14 01:19:00</time> 
    var div_list = document.getElementsByTagName("time");
    for(var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var html = item.getAttribute("datetime");
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
        date_string = html.substring(0, 10); 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }    
    return info;
  }
}

class 科技產業資訊室 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "科技產業資訊室";
    this.domain_name = "iknow.stpi.narl.org.tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("span");
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var id = item.getAttribute("id");
      if (id != null) {
        if (id.indexOf("CreateTime") != -1) {
          html = item.innerHTML;
          var p = html.indexOf("於");
          html = html.substr(p+1);
          html = html.replace("年", "-");
          html = html.replace("月", "-");
          html = html.replace("日", "");
          var year = 0;
          html = html.trim();
          if (html.length > 4) {
            year = parseInt(html.substring(0, 4));
          }
          if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
            date_string = html.substring(0, 10); 
            break;
          }
        }
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}

class Yahoo股市 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "Yahoo股市";
    this.domain_name = "tw.stock.yahoo.com";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("span"); //<span class="t1">2019/11/02 09:40</span>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var c = item.getAttribute("class");
      if (c != null) {
        if (c == "t1") {
          html = item.innerHTML;
          html = html.replace("/", "-");
          var year = 0;
          html = html.trim();
          if (html.length > 4) {
            year = parseInt(html.substring(0, 4));
          }
          if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
            date_string = html.substring(0, 10); 
            break;
          }
        }
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}

class Yahoo新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "Yahoo新聞";
    this.domain_name = "tw.news.yahoo.com";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("time");
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("datetime");
      if (attr != null) {
        html = attr
        html = html.replace("/", "-");
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 32 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}

class MSN財經 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "MSN財經";
    this.domain_name = "www.msn.com/zh-tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("time"); //<time datetime="2019-05-02T05:30:10.000Z">2019/5/2</time>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("datetime");
      if (attr != null) {
        html = attr;
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 32 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}

class LEDInside extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "LEDInside";
    this.domain_name = "ledinside.com.tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("div"); //<div class="submitted">2019-10-14 18:23 [編輯：YiningChen]</div>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("class");
      if (attr != null && attr == "submitted") {
        html = item.innerHTML;
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 64 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}
  
class EETTaiwan extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "EETTaiwan";
    this.domain_name = "eettaiwan.com";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var date_string = false;
    var info = super.GetInfo();
    if (info.URL == false) {
      info.URL = window.location.href;
    }
    var tag = "publishedDate";
    var markup = document.documentElement.innerHTML;
    var p = markup.indexOf(tag);
    if (p != -1) {
      var year;
      var offset = p+tag.length+1;
      var p1 = markup.indexOf('"', offset);
      var p2 = markup.indexOf('"', p1+1);
      p1 = p1 + 1;
      var html = markup.substr(p1, p2-p1);
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("-") != -1 && html.length <= 64 && year > 1911) {
        date_string = html.substring(0, 10); 
      }
    }    
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
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
  var data;
  for (let item of NewsSiteList) {
    var nobj = eval("new " + item + "()");
    if (nobj.Test()) {
      data = nobj.GetInfo();
      if (DebugFlags & 1) {
        console.log(item);
        console.log(data);
      }
      if (data.Site !== false && data.URL !== false && data.Title !== false && data.Date !== false) {
        info = data;
      }      
      break;
    }
  }
  //
  // Try ld+json Mode if nothing
  //
  if (info == false) {
    var lobj = new LdJsonClass();
    if (lobj.Object !== false) {
      jobj = lobj.Object;
      data = {};
      data.Title = jobj.headline;
      data.Date = NormalizeDateString(jobj.datePublished);
      if (isset(jobj.url)) {
        data.URL = jobj.url;
      } else {
        data.URL = window.location.href;
      }      
      data.Site = jobj.publisher.name;
      if (DebugFlags & 1) {
        console.log("@LdJsonClass");
        console.log(data);
      }
      if (data.Site !== false && data.URL !== false && data.Title !== false && data.Date !== false) {
        info = data;
      }      
    }
  }
  //
  // Try base Class if nothing
  //
  if (info == false) {
    var nobj = new NewsBaseClass();
    var data = nobj.GetInfo();
    if (DebugFlags & 1) {
      console.log("@NewsBaseClass");
      console.log(data);
    }
    if (data.Site !== false && data.URL !== false && data.Title !== false && data.Date !== false) {
      info = data;
    }
  }  
  //
  // Generate HTML formated data then set to clipboard
  //
  if (info !== false) {    
    if (request.mode == 0) {
      ClipboardBuffer = sprintf("%s, <a href='%s'>%s</a>", info.Date, info.URL, info.Title);
      document.execCommand('copy');
    } else if (request.mode == 1) {
      ClipboardBuffer = sprintf("<a href='%s'>%s</a>", info.URL, info.Title);
      document.execCommand('copy');
    } else {      
    }
  } else {
    alert('Info: Can\'t generate news link of the page'); 
  }
  //
  // Sample Code
  //
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");  
  if (request.greeting == "hello") {
    sendResponse({farewell: "goodbye", info: info});
  }    
});