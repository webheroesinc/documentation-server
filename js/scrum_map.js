var current_header_layer = 0;
var current_story	= {};
var current_sprint	= {};

var scrum_map		= {
    initialize: function() {
    },

    directive: function (p,n,html) {
	if (n.directiveName === 'title:')
	    return '<div class="header"><h1>'+html+'</h1></div>';
	else if (n.directiveName === 'quote')
	    return '<blockquote>'+html+'</blockquote>';
	else if (n.directiveName === 'src')
	    return '<pre>'+html+'</pre>';
	else if (n.directiveName === 'example')
	    return '<pre>'+html+'</pre>';
	// else
	    // console.log(n);
	return html;
    },

    header: function (p,n,html) {
	var l		= n.level;
	var elem	= '';

	var diff	=  l - current_header_layer;

	for( i=0; i <= diff + 1; i++ )
	    elem	+= '</div>';

	current_header_layer = l
	switch( l ) {
	case 1:
	    elem		+= '<div class="print-hide"><h1>'+html+'</h1>';
	    break;
	case 2:
	    current_sprint.class	= $(html).text().replace(/ /, '-').toLowerCase();
	    current_sprint.text		= $(html).text();

	    var btn		= $('<button />')
		.addClass( 'btn btn-lg btn-info print-hide print-stories pull-right' )
		.attr( 'sprint-id', current_sprint.class )
		.text( 'Print Stories' )[0].outerHTML
	    
	    var title			= '<h2 class="print-hide">' + $(html).text() + btn + '</h2>';
	    elem			+= title
	    break;
	case 3:
	    current_story.class	= $(html).text().replace(' ', '-').toLowerCase();
	    current_story.text	= $(html).text();

	    var btn		= $('<button />')
		.addClass( 'btn btn-lg btn-warning print-hide print-tasks' )
		.attr('story-id', current_story.class )
		.text( 'Print Tasks' )[0].outerHTML
	    
	    elem		+= '<hr/>'+
		'<span class="pull-right">' + btn + '</span>' +
		'<div class="story card" parent-sprint="'+current_sprint.class+'">' +
		'<div class="card-title">'+html+'</div>'
	    
	    break;
	case 4:
	    elem		+= '<div class="task card" parent-story="' + current_story.class + '">' +
		'<div class="card-title">' + html +
		'<div class="parent-story">' + current_story.text + '</div>' +
		'</div>';
	    break;
	}
	return elem;
    },
    text: function (p, n, html) {
	var regex	= /^:(\w+):/;
	
	// Check if element is inside of a list element
	if ( n.value && regex.test( n.value.trim() ) ) {
	    var array	= n.value.split(':');
	    var cls	= array[1];
	    var value	= array[2].trim();
	    return '<div class="scrum-number '+ cls.toLowerCase() +'">'+ value +'</div>';
	}
	// text should do a HTML convert so that '<' becomes '&thing;'
	return n.value !== undefined ?
	    '<p>'+n.value+'</p>'
	    : '<span style="color: #C00;">No value for text</span>';
    },
    inlineContainer: function (p, n, html) {
	return html;
    },
    paragraph: function (p, n, html) {
	return '<p>'+html+'</p>';
    },
    bold: function (p, n, html) {
	return '<b>'+html+'</b>';
    },
    underline: function (p, n, html) {
	return '<u>'+html+'</u>';
    },
    link: function (p, n, html) {
	if( n.src.substr(0,7) == 'http://' ||
	    n.src.substr(0,8) == 'https://' )
	    return '<a target="_blank" href="' + n.src + '">'+html+'</a>';

	return '<a href="?f=' + n.src + '">'+html+'</a>';
    },
    code: function (p, n, html) {
	return '<code>'+html+'</code>';
    },
    preformatted: function (p, n, html) {
	return '<pre>'+html+'</pre>';
    },
    table: function (p, n, html) {
	return '<table class="table table-condensed table-striped">'+html+'</table>';
    },
    tableRow: function (p, n, html) {
	return '<tr>'+html+'</tr>';
    },
    tableCell: function (p, n, html) {
	return '<td>'+html+'</td>';
    },
    unorderedList: function (p, n, html) {
	return '<ul>'+html+'</ul>';
    },
    orderedList: function (p, n, html) {
	return '<ol>'+html+'</ol>';
    },
    listElement: function (p, n, html) {
	return '<li>'+html+'</li>';
    },
    "default": function (p, n, html) {
	console.log('Not handling node type:', n.type);
	return '';
    }
}

$(document).on( 'converted', function() {
    console.log('Triggered Event')
    $( 'button.print-stories' ).on( 'click', function() {
	var selection		= '.card.story[parent-sprint="' + $( this ).attr( 'sprint-id' ) + '"]'
	console.log( "selection",selection)
	$( '.card' ).addClass( 'hidden' );
	$( selection ).removeClass( 'hidden' );
	window.print();
	$( '.card' ).removeClass( 'hidden' );
    } )

    $( 'button.print-tasks' ).on( 'click', function() {
	var selection		= '.card.task[parent-story="' + $( this ).attr( 'story-id' ) + '"]'
	console.log( "selection",selection)
	$( '.card' ).addClass( 'hidden' );
	$( selection ).removeClass( 'hidden' );
	window.print();
	$( '.card' ).removeClass( 'hidden' );
    } )
} )
