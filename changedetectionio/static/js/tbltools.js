// table tools

// must be a var for keyChar and keyCode use
var CONSTANT_ESCAPE_KEY = 27;

// global sorting vars (new window is always last_changed, descending)
var loading;
var sort_column;
var sort_order;

// restore scroll position on submit/reload 
document.addEventListener("DOMContentLoaded", function(event) { 
	var scrollpos = sessionStorage.getItem('scrollpos');
	if (scrollpos) window.scrollTo(0, scrollpos);
});
// mobile scroll position retention 
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	document.addEventListener("visibilitychange", function() {
		storeScrollAndSearch();
	});
}
else {
	// non-mobile scroll position retention 
	window.onbeforeunload = function(e) {
		storeScrollAndSearch();
	};
}
function storeScrollAndSearch() {
	sessionStorage.setItem('scrollpos', window.pageYOffset);
	sessionStorage.setItem('searchtxt', document.getElementById("txtInput").value);
}

// page load functions
function load_functions() {
	// loading
	loading = true;
	// retain checked items
	checkChange();
	// retrieve saved sorting
	getSort();
	// sort
	sortTable(sort_column);
	// search
	if (isSessionStorageSupported()) {
		// retrieve search
		if ( sessionStorage.getItem("searchtxt") != null ) {
			document.getElementById("txtInput").value = sessionStorage.getItem("searchtxt");
			tblSearch(this);
		}
	}
}

// sorting
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("watch-table");
  switching = true;
  //Set the sorting direction, either default 9, 1 or saved
  if (loading) {
	getSort();
	n = sort_column;
	dir = (sort_order == 0) ? "asc" : "desc";
	loading = false;
  }
  else {
	dir = "asc";
  }
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      x = x.innerHTML.toLowerCase();
      y = y.innerHTML.toLowerCase();
	  /* handle # columns */
	  if (!isNaN(x)) { 
		x = parseFloat(x);
		y = parseFloat(y);
	  }
	  /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
		if (x > y) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x < y) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;      
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
  // hide all asc/desc sort arrows
  sortimgs = document.querySelectorAll('[id^="sort-"]');
  for (var i = 0; i < sortimgs.length; i++) {
	sortimgs[i].style.display = "none";
  }
  // show current asc/desc sort arrow and set sort_order var
  if (dir == "asc") {
    document.getElementById("sort-" + n + "a").style.display = "";
  }
  else {
	document.getElementById("sort-" + n + "d").style.display = "";
  }
  // show all sortable indicators
  sortableimgs = document.querySelectorAll('[id^="sortable-"]');
  for (var i = 0; i < sortableimgs.length; i++) {
    sortableimgs[i].style.display = "";
  }
  // hide sortable indicator from current column
  document.getElementById("sortable-" + n).style.display = "none";
  // save sorting
  sessionStorage.setItem("sort_column", n);
  sessionStorage.setItem("sort_order", (dir == "asc") ? 0 : 1);
  // restripe
  restripe();
}

// check/uncheck all checkboxes
function checkAll(e) {
	var checkboxes = document.getElementsByName('check');
	var checkboxFunctions = document.querySelectorAll('[id=checkbox-functions]');
	if (e.checked) {
		for (var i = 0; i < checkboxes.length; i++) {  
			checkboxes[i].checked = true;
		}
		for (var i = 0; i < checkboxFunctions.length; i++) {
			checkboxFunctions[i].style.display = "";
		}
	}
	else {
		for (var i = 0; i < checkboxes.length; i++) {
			checkboxes[i].checked = false;
		}
		for (var i = 0; i < checkboxFunctions.length; i++) {
			checkboxFunctions[i].style.display = "none";
		}
	}
}

// check/uncheck checkall checkbox if all other checkboxes are checked/unchecked
function checkChange(){
	var totalCheckbox = document.querySelectorAll('input[name="check"]').length;
	var totalChecked = document.querySelectorAll('input[name="check"]:checked').length;
	var checkboxFunctions = document.querySelectorAll('[id=checkbox-functions]');
	if(totalCheckbox == totalChecked) {
		document.getElementsByName("showhide")[0].checked=true;
	}
	else {
		document.getElementsByName("showhide")[0].checked=false;
	}
	if(totalChecked == 0) {
		for (var i = 0; i < checkboxFunctions.length; i++) {
			checkboxFunctions[i].style.display = "none";
		}
	}
	else {
		for (var i = 0; i < checkboxFunctions.length; i++) {
			checkboxFunctions[i].style.display = "";
		}
	}
}

// search watches in Title column
function tblSearch(evt) {
  var code = evt.charCode || evt.keyCode;
  if (code == CONSTANT_ESCAPE_KEY) {
    document.getElementById("txtInput").value = '';
  }
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("txtInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("watch-table");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[5]; // col 5 is the hidden title/url column
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } 
	  else {
		tr[i].style.display = "none";
      }
    }       
  }
  restripe();
}

// restripe after searching
function restripe () {
	var visrows = [];
	var table = document.getElementById("watch-table");
	var rows = table.getElementsByTagName("tr");
	
	for (i = 0; i < rows.length; i++) {
 		if (rows[i].style.display !== "none") {
			visrows.push(rows[i]);
		}
	}
	for (var i=0 ; i<visrows.length; i++) {
		var row = visrows[i];
		var cells = row.getElementsByTagName("td");
		for(var j=0; j<cells.length; j++) {
			if( i%2==0 ) {
				cells[j].style.background = "#ffffff";
			} else {
				cells[j].style.background = "#f2f2f2";
			}
		}
	}
}

// get checked or all uuids
function getChecked(items) {
	if ( items === undefined ) {
		var checkedArr = document.querySelectorAll('input[name="check"]:checked');
	}
	else {
		var checkedArr = document.querySelectorAll('input[name="check"]');
	}
	if ( checkedArr.length > 0 ) {
		let output = [];
		for (var i = 0; i < checkedArr.length; i++  ) {
			output.push( checkedArr[i].parentNode.parentNode.getAttribute("id") );
		}
	var uuids = "";
		for (var i = 0; i < checkedArr.length; i++  ) {
			if (i < checkedArr.length - 1 ) {
				uuids += output[i] + ",";
			} else {
				uuids += output[i];
			}
		}
	} else {
		uuids = '';
	}
	return uuids;
}

// process selected watches 
function processChecked(func, tag) {
	if ( func == 'mark_all_notviewed' ) { 
		uuids = getChecked('all');
	}
	else {
		uuids = getChecked();
	}
	// confirm if deleting
	if ( func == 'delete_selected' && uuids.length > 0 ) {
		result = confirm('Deletions cannot be undone.\n\nAre you sure you want to continue?');
		if ( result == false) {
			return;
		}
	}
	// href locations
	var currenturl = window.location;
 	var posturl = location.protocol + '//' + location.host +  '/api/process-selected';
	// posting vars
	const XHR = new XMLHttpRequest(),
    FD  = new FormData();
	// fill form data
	FD.append('func', func);
	FD.append('tag', tag);
	FD.append('uuids', uuids);
	// success
	XHR.addEventListener( 'load', function( event ) {
		window.location = currenturl;
	});
	// error
	XHR.addEventListener(' error', function( event ) {
		alert( 'Error posting request.' );
	});
	// set up request
	XHR.open( 'POST', posturl );
	// send
	XHR.send( FD );
}

function clearSearch() {
	document.getElementById("txtInput").value = '';
	tblSearch(CONSTANT_ESCAPE_KEY);
}

function isSessionStorageSupported() {
    var storage = window.sessionStorage;
    try {
      storage.setItem('test', 'test');
      storage.removeItem('test');    
      return true;
    } catch (e) {
      return false;
    }
}

function getSort() {
	if (isSessionStorageSupported()) {
		// retrieve sort settings if set
		if ( sessionStorage.getItem("sort_column") != null ) {
			sort_column =  sessionStorage.getItem("sort_column");
			sort_order =  sessionStorage.getItem("sort_order");
		}
		else {
			sort_column = 9; // last changed
			sort_order = 1;  // desc
			//alert("Your web browser does not support retaining sorting and page position.");
		}
	}
}
