// Default org -> html conversion map
var current_header_layer = 0;
var default_map = {
    directive: function (p,n,html) {
	if (n.directiveName === 'title:')
	    return '<div class="header"><h1>'+n.directiveRawValue+'</h1></div>';
	else if (n.directiveName === 'quote')
	    return '<div><blockquote>'+n.directiveRawValue+'</blockquote></div>';
	else if (n.directiveName === 'src')
	    return '<div><pre>'+html+'</pre></div>';
	else if (n.directiveName === 'example')
	    return '<div><pre>'+html+'</pre></div>';
	else if (n.directiveName === 'img:')
	    return '<div><img src="'+n.directiveRawValue+'"/></div>';
	else if (n.directiveName === 'screenshot:')
	    return '<p class="screenshot"><img src="'+n.directiveRawValue+'"/></p>';
	else if (n.directiveName === 'logo:')
	    return '<div class="logo"><a href="/"><img src="'+n.directiveRawValue+'"/></a></div>';
	else if (n.directiveName === 'warn:')
	    return '<div><p class="alert alert-warning">'+n.directiveRawValue+'</p></div>';
	else if (n.directiveName === 'danger:')
	    return '<div><p class="alert alert-danger">'+n.directiveRawValue+'</p></div>';
	else if (n.directiveName === 'info:') {
	    return '<div><p class="alert alert-info">'+n.directiveRawValue+'</p></div>';
	}
	else if (n.directiveName === 'lead') {
	    console.log("lead", n, html);
	    return '<div class="lead">'+html+'</div>';
	}
	else
	    console.log(n);
	return html;
    },
    header: function (p,n,html) {
	var level	= n.level;
	var elem	= '';

	var diff	=  current_header_layer - level;
	console.log("Last level:", current_header_layer, "new level:", level, "diff", diff);
	// if we are going up a header level, close off the last div
	// tag.

	// for every level of difference, add a closing div tag
	for( var i=0; i<=diff; i++ )
	    elem	+= '</div>';
	
	current_header_layer = level
	elem		+= '<div class="header-level-'+level+'"><h'+level+' id="'+html.replace(/ /g, '-').toLowerCase()+'">'+html+'</h'+level+'>';
	console.log(level, current_header_layer, diff, elem);

	return elem
    },
    text: function (p, n, html) {
	// text should do a HTML convert so that '<' becomes '&thing;'
	return n.value !== undefined ? n.value : '<span style="color: #C00;">No value for text</span>';
    },
    inlineContainer: function (p, n, html) {
	return html;
    },
    paragraph: function (p, n, html) {
	return '<div><p>'+html+'</p></div>';
    },
    bold: function (p, n, html) {
	return '<b>'+html+'</b>';
    },
    underline: function (p, n, html) {
	return '<u>'+html+'</u>';
    },
    italic: function (p, n, html) {
	return '<i>'+html+'</i>';
    },
    link: function (p, n, html) {
	if( n.src.substr(0,7) == 'http://' ||
	    n.src.substr(0,8) == 'https://' )
	    return '<a target="_blank" href="' + n.src + '">'+html+'</a>';

	if(n.src[0] === "#")
	    return '<a href="' + n.src + '">'+html+'</a>';
	return '<a href="?f=' + n.src + '">'+html+'</a>';
    },
    code: function (p, n, html) {
	return '<div><code>'+html+'</code></div>';
    },
    preformatted: function (p, n, html) {
	return '<div><pre>'+html+'</pre></div>';
    },
    table: function (p, n, html) {
	return '<div><table class="table table-striped">'+html+'</table></div>';
    },
    tableRow: function (p, n, html) {
	return '<tr>'+html+'</tr>';
    },
    tableCell: function (p, n, html) {
	return '<td>'+html+'</td>';
    },
    unorderedList: function (p, n, html) {
	return '<div><ul>'+html+'</ul></div>';
    },
    orderedList: function (p, n, html) {
	return '<div><ol>'+html+'</ol></div>';
    },
    listElement: function (p, n, html) {
	return '<li>'+html+'</li>';
    },
    "default": function (p, n, html) {
	console.log('Not handling node type:', n.type);
	return html || '';
    }
}

function Converter(parsed, map) {
    var html		= '';
    var nodes		= parsed.nodes || [];
    switch( map ) {
    case 'scrum':
	map	= scrum_map
	break;
    default:
	map	= default_map;
    }
    
    for (var k in nodes) {
	var node	= nodes[k];
	html		+= recursive( node, 'children', function(parents, node, end, innerHTML) {
	    if ( map[node.type] !== undefined ) {
		html	= map[node.type](parents, node, innerHTML);
	    }
	    else if (map['default'] !== undefined) {
		html	= map['default'](parents, node, innerHTML);
	    }
	    else {
		html	= innerHTML || node.value || '';
	    }
	    return html;
	});
    }
    console.log(html);
    html		= $.parseHTML( html )
    if( typeof map.initialize === 'function' )
	map.initialize()
    
    return html;
}

function recursive(node, key, callback, parents) {
    var end			= false;
    var elements		= [];
    if (node[key].length !== 0) {
	if (parents === undefined)
	    parents		= [node.type];
	else
	    parents.push(node.type);

	for (var i in node[key]) {
	    elements.push( recursive(node[key][i], key, callback, parents) );
	}
    }
    else
	end			= true;
    return callback(parents || [], node, end, elements.join(''));
}
