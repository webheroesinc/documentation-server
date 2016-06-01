var parser	= new Org.Parser();
var $content	= $('#content');

function get_param(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex		= new RegExp("[\\?&]" + name + "=([^&#]*)");
    var result	= ( regex.exec( location.search ) || [] )[1];
    
    return result === undefined
	? ""
	: decodeURIComponent( result
			      .replace( /\+/g, " " )
			      .replace( /\/$/, '' ) );
}

var base_dir		= '/wiki'
var path		= base_dir + '/' + ( get_param( 'file' ) || get_param( 'f' ) || 'home.org' )

// Validate this is a .org link we're looking for
if( path.substr( -4 ) !== '.org' )
    path		= path+'.org'

$.ajax( {
    url: path,
    dataType: 'text',
    success: function( text ) {
	var parsed	= parser.parse( text );
	html		= Converter( parsed, get_param('map') || null );

	$content.append( html );

	var $index	= $('<ul/>').addClass('index');
	$('h1, h2, h3, h4, h5, h6').not('.header *').each( function(i, el) {
	    $index
		.append(
		    $('<li/>')
			.addClass(el.tagName)
			.append(
			    $('<a/>').attr('href', '#'+$(el)
					   .html().replace(/ /g, '-')
					   .toLowerCase())
				.html($(el).html())
			)
		)
	} );

	$('.header').after($index);

	$('.screenshot').on('click', function() {
	    $(this).toggleClass('active');
	})
	
	$(document).trigger('converted')
    },
    error: function( a, b, c ) {
	$( '.error' )
	    .removeClass('hidden')
	    .append([
		$( '<strong />' ).html( '404 File Not Found: ' ),
		$( '<span />' ).html( path )
	    ]);
	console.log( "Call Error", arguments );
    }
} )
