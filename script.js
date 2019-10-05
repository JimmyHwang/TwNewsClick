$(document).ready(function () {
  $('body').append('<textarea id="test"/>');
  var $test = $('#test');
  $test.text('some text which should appear in clipboard');
  $test.select();
  document.execCommand('copy');
  //alert('copied!');
  //alert("@1");
});

document.addEventListener('copy', function(e) {
  e.clipboardData.setData('text/html', "2019-01-01, <a href='http://www.google.com'>Google</a>");
  e.preventDefault();
});

/*
setTimeout(function() {
  chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function (tabs) {
      tabURL = tabs[0].url;
      console.log("URL from get-url.js", tabURL);
  });
}, 500);
*/
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    // tabs[0].url;     //url
    // tabs[0].title;   //title
// });




/*chrome.tabs.query(null, function(tab){
  //var url = tab.title;     //url
  console.log(tab);
  //alert("123");
    //console.log(tabs[0].url);     //url
    //console.log(tabs[0].title);   //title
});
*/
