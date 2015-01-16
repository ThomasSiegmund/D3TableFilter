/*------------------------------------------------------------------------
	- HTML Table Filter Generator 
	- Columns Resizer Extension v1.3
	- By Max Guglielmi (tablefilter.free.fr)
	- Licensed under the MIT License
--------------------------------------------------------------------------
Copyright (c) 2009 Max Guglielmi

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------*/

TF.prototype.SetColsResizer = function(extName)
{
	var o = this, f = o.fObj, ext = (extName) ? o.Ext.list[extName] : o.Ext.list['ColumnsResizer'];
	o.colsResizer = 	(f!=undefined && f.cols_resize==undefined) ? true : f.cols_resize;
	if(!o.colsResizer) return;									

	//Extension info
	o.colsResizerExtLoaded =			false;
	o.colsResizerExtName =				ext.name;
	o.colsResizerDesc =					ext.description;

	//Paths, filenames
	o.crExtPath = 						(ext.path == undefined) ? 'TFExt_ColsResizer/' : ext.path;
	o.crStylesheet =   					f!=undefined && f.col_resizer_stylesheet!=undefined 
											? f.col_resizer_stylesheet : o.crExtPath + 'TFExt_ColsResizer.css';
	o.crTblCssClass =					f!=undefined && f.col_resizer_table_css_class!=undefined //css class for resizable table 
											? f.col_resizer_table_css_class :'resizable';
	o.crHandleCssClass =				f!=undefined && f.col_resizer_handle_css_class!=undefined //css class for resize handle 
											? f.col_resizer_handle_css_class :'resizer';
	o.crTextEllipsisCssClass =			f!=undefined && f.col_resizer_text_ellipsis_css_class!=undefined //css class for cell ellipsis 
											? f.col_resizer_text_ellipsis_css_class :'ellipsis';
	o.crNoWrapCssClass =				f!=undefined && f.col_resizer_nowrap_css_class!=undefined //css class for nowrap cell 
											? f.col_resizer_nowrap_css_class :'nowrap';
	o.crCursor = 						f!=undefined && f.col_resizer_cursor_type!=undefined //resize pointer 
											? f.col_resizer_cursor_type :'e-resize';
	o.crShowHandle =					f!=undefined && f.col_resizer_show_handle!=undefined //enable/disable resize handle 
											? f.col_resizer_show_handle : true;
	o.crAllCells =						f!=undefined && f.col_resizer_all_cells!=undefined //enable/disable resize to all column cells handle 
											? f.col_resizer_all_cells : false;
	o.crHideFiltersOnResize =			f!=undefined && f.col_resizer_hide_filters_on_resize!=undefined //enable/disable filters hiding on resize 
											? f.col_resizer_hide_filters_on_resize : false;			
	o.crColsHeadersTbl =				f!=undefined && f.col_resizer_cols_headers_table!=undefined //only if external headers
											? tf_Id(f.col_resizer_cols_headers_table) : null;
	o.crColsHeadersIndex = 				f!=undefined && f.col_resizer_cols_headers_index!=undefined //only if external headers
											? f.col_resizer_cols_headers_index : 1;										
	o.crTableLayout =					f!=undefined && f.col_resizer_table_layout!=undefined 
											? f.col_resizer_table_layout :'fixed';//defines table-layout property
	o.crEnableTextEllipsis =			f!=undefined && f.col_enable_text_ellipsis!=undefined 
											? f.col_enable_text_ellipsis :true;//enable/disable cell text ellipsis 
	o.crEnableNoWrap =					f!=undefined && f.col_resizer_enable_nowrap!=undefined 
											? f.col_resizer_enable_nowrap :false;//enable/disable cell nowrap 		
	o.crMinWidth =						f!=undefined && f.col_resizer_min_width!=undefined 
											? f.col_resizer_min_width :'10';//defines min width for cell resize
	o.crWidthAdjustment = 				f!=undefined && f.col_resizer_width_adjustment!=undefined 
											? f.col_resizer_width_adjustment :'9';//adjustment width when cell is resized
	o.crDisableColResize =				f!=undefined && f.col_resizer_disable_resize!=undefined //enable/disable resize on desired cols
											? f.col_resizer_disable_resize : null;			
	o.crHasSort =						o.sort;
	o.crWColsRow =						null;
	o.crWRowDataTbl =					null;				

	//prefixes
	o.prfxCrColIndex =					'_ci'; //col index attribute name

	/*** Extension events ***/
	//calls function before col is resized
	o.onBeforeColResized =				f!=undefined && tf_isFn(f.on_before_col_resized)
									 		? f.on_before_col_resized : null;
	//calls function after col is resized
	o.onAfterColResized =				f!=undefined && tf_isFn(f.on_after_col_resized)
									 		? f.on_after_col_resized : null;
	
	//Loads extension stylesheet
	o.IncludeFile(ext.name+'Style', o.crStylesheet, null, 'link');	
	
	o.Resizable = {
		init: function()
		{
			var tbl = (o.crColsHeadersTbl) ? o.crColsHeadersTbl : o.tbl;
			var headerIndex = (o.crColsHeadersTbl) ? o.crColsHeadersIndex : o.GetHeadersRowIndex();
			
			o.crWColsRow = tbl.rows[headerIndex];
			if(tf_isIE) o.crWColsRow = tbl.rows[0];
			
			if(o.crColsHeadersTbl && o.tbl.rows[0].style.display=='none' && !o.gridLayout){
				o.crWRowDataTbl = o.tbl.rows[0];
				o.crWRowDataTbl.style.display = '';
				o.crWRowDataTbl.style.height = '0px';
			}
			
			if(o.gridLayout) o.crWRowDataTbl = o.tbl.rows[0];
			
			if(!o.gridLayout){
				if(o.crTableLayout=='fixed'){
					//Makes table-layout fixed and borders collapsed
					tf_addClass(tbl,o.crTblCssClass);
					if(o.crColsHeadersTbl) tf_addClass(o.tbl,o.crTblCssClass);
				} else {
					tbl.style.tableLayout = o.crTableLayout;
					if(o.crColsHeadersTbl) o.tbl.style.tableLayout = o.crTableLayout;
				}
			}
			
			if(o.crEnableTextEllipsis){ 
				tf_addClass(tbl, o.crTextEllipsisCssClass);
				if(o.crColsHeadersTbl) tf_addClass(o.tbl, o.crTextEllipsisCssClass);
			}
			
			if(o.crEnableNoWrap){
				tf_addClass(tbl, o.crNoWrapCssClass);
				if(o.crColsHeadersTbl) tf_addClass(o.tbl, o.crNoWrapCssClass);
			}
			
			for(var k=0; k<tbl.rows.length; k++)
			{
				var r = (!o.crColsHeadersTbl) ? tbl.rows[k] : o.crColsHeadersTbl.rows[k];
				for(var j=0; j<r.cells.length; j++)
				{
					if(o.crDisableColResize!=null && o.crDisableColResize.tf_Has(j)) continue;
					var c = r.cells[j];
					c.setAttribute(o.prfxCrColIndex,j);
					tf_addEvent(c, 'mouseover', o.Resizable.initDetect);
					tf_addEvent(c, 'mouseout', o.Resizable.killDetect);
					
					if(!o.gridLayout){
						if(tf_isIE && o.GetFiltersRowIndex()==0 && k==0 && !o.crColsHeadersTbl)
							c.style.width = tbl.rows[o.GetHeadersRowIndex()].cells[j].clientWidth + 'px';
	
						//Synchronise cell widths with external table containing filters
						if(o.crColsHeadersTbl && k==0){ 
							if(o.colWidth) c.style.width = o.colWidth[j];
							c.style.width = o.tbl.rows[1].cells[j].clientWidth + 'px';
							o.crWRowDataTbl.cells[j].style.width = c.clientWidth + 'px';
							o.tbl.rows[1].cells[j].style.width = '';
							var headCellCW = c.clientWidth;
							var cellCW = o.crWRowDataTbl.cells[j].clientWidth;
	
							if(cellCW!=headCellCW){
								if(headCellCW>cellCW){
									o.crWRowDataTbl.cells[j].style.width = (parseInt(c.clientWidth) - (headCellCW-cellCW)) + 'px';
								}
								if(headCellCW<cellCW){
									c.style.width = (parseInt(o.crWRowDataTbl.cells[j].clientWidth) - (cellCW-headCellCW)) + 'px';
								}
							}
						}
					}
				} 
				if(!o.crAllCells && k==headerIndex) break;
			}
			//Resizes top div containing information
			if(o.infDiv && !o.gridLayout) o.infDiv.style.width = o.tbl.clientWidth-o.crWidthAdjustment+'px';
		},
		resize: function(index, w)
		{
			if(index==null || w==null) return;
			
			var cell = o.crWColsRow.cells[index];
			var padL = isNaN(cell.style.paddingLeft) ?  cell.style.paddingLeft : '0px';
			var padR = isNaN(cell.style.paddingRight) ? cell.style.paddingRight : '0px';
			var pad = parseInt(padL,10) + parseInt(padR,10);
			w = Math.max(w-pad, o.crMinWidth);
			cell.style.width = w+'px';
			
			if(o.crHideFiltersOnResize)
				o.tbl.rows[o.GetFiltersRowIndex()].style.visibility = 'visible';
		},
		initDetect: function(e) 
		{
			if(!o.colsResizer) return;
			var c = TF.Evt.srcElement(e);
			tf_addEvent(c, 'mousemove', o.Resizable.detectHandle);
			tf_addEvent(c, 'mousedown', o.Resizable.startResize);
		},
		detectHandle: function(e)
		{
			if(!o.colsResizer) return;
			var cell = TF.Evt.srcElement(e);
			if(o.Resizable.pointerPos(cell,TF.Evt.pointerX(e),TF.Evt.pointerY(e)))
			{
				cell.style.cursor = o.crCursor;
				o.Resizable._onHandle = true;
				if(o.crHasSort) o.sort = false;
			} else {
				cell.style.cursor = '';
				o.Resizable._onHandle = false;
				if(o.crHasSort) o.sort = true;
			}
		},
		killDetect: function(e) 
		{			
			o.Resizable._onHandle = false;
			var cell = TF.Evt.srcElement(e);
			tf_removeEvent(cell, 'mousemove', o.Resizable.detectHandle);
			tf_removeEvent(cell, 'mousedown', o.Resizable.startResize);			
			if(o.crHasSort) o.sort = true;
		},
		startResize: function(e)
		{
			if(!o.Resizable._onHandle) return;
			
			var cell = TF.Evt.srcElement(e);			
			o.Resizable._cell = cell;
			o.Resizable._tbl = o.tbl;
			var colIndex = cell.getAttribute(o.prfxCrColIndex);
			
			//before col is resized event
			if(o.onBeforeColResized) o.onBeforeColResized.call(null,o,colIndex);
			
			if(o.crHasSort) o.sort = false;
			
			if(o.crShowHandle){
				//only for IE
				var handle = tf_Id('resHandle_'+o.id+'_'+colIndex);
				if(handle) handle.outerHTML = '';
				
				o.Resizable._handle = tf_CreateElm('div',['id','resHandle_'+o.id+'_'+colIndex],[o.prfxCrColIndex,colIndex]);
				o.Resizable._handle.className = o.crHandleCssClass;
				var handleH = (o.gridLayout) ? o.tblCont.clientHeight : o.tbl.offsetHeight;
				var pointerX = (o.gridLayout) ? TF.Evt.pointerX(e) - (tf_StandardBody().scrollLeft + o.tblCont.scrollLeft) : TF.Evt.pointerX(e);
				o.Resizable._handle.style.cssText = 'top:'+TF.Evt.objPosition(o.tbl,['table'])[1]+'px; left:'+pointerX+'px; height:'+handleH+'px;';
				//tf_StandardBody().appendChild(o.Resizable._handle);
				o.tbl.parentNode.insertBefore(o.Resizable._handle,o.tbl);
			}
			
			if(o.crHideFiltersOnResize)
				o.tbl.rows[o.GetFiltersRowIndex()].style.visibility = 'hidden';
				
			tf_addEvent(tf_StandardBody(), 'mousemove', o.Resizable.drag);
			tf_addEvent(tf_StandardBody(), 'mouseup', o.Resizable.endResize);
			
			TF.Evt.cancelEvent(e);
			TF.Evt.stopEvent(e);
		},
		endResize: function(e) 
		{
			var cell = o.Resizable._cell;
			var colIndex;
			
			if(cell && cell.getAttribute(o.prfxCrColIndex)!=null)
			{
				colIndex = cell.getAttribute(o.prfxCrColIndex);
				var width = (TF.Evt.pointerX(e) - TF.Evt.objPosition(cell,['th','td'])[0]) - o.crWidthAdjustment;
			 	o.Resizable.resize(colIndex, width);
				if(o.crColsHeadersTbl){
					o.crWRowDataTbl.cells[colIndex].style.width = cell.clientWidth + 'px';
					var headCellCW = parseInt(cell.clientWidth);
					var cellCW = parseInt(o.crWRowDataTbl.cells[colIndex].clientWidth);
					if(cellCW!=headCellCW){
						cell.style.width = (parseInt(o.crWRowDataTbl.cells[colIndex].clientWidth) - (cellCW-headCellCW)) + 'px';
					}					
				}
			}
			
			tf_removeEvent(tf_StandardBody(), 'mousemove', o.Resizable.drag);
			tf_removeEvent(tf_StandardBody(), 'mouseup', o.Resizable.endResize);
			//tf_StandardBody().removeChild(o.Resizable._handle);
			if(o.crShowHandle && o.Resizable._handle)
				o.tbl.parentNode.removeChild(o.Resizable._handle);
			
			if(cell) tf_removeEvent(cell, 'mouseout', o.Resizable.killDetect);				
			o.Resizable._tbl = o.Resizable._handle = o.Resizable._cell = null;
			
			//Resizes top div containing information
			if(o.infDiv && !o.gridLayout) o.infDiv.style.width = o.tbl.clientWidth-o.crWidthAdjustment+'px';
			
			//after col is resized event
			if(o.onAfterColResized) o.onAfterColResized.call(null,o,colIndex);
			
			TF.Evt.cancelEvent(e);
			TF.Evt.stopEvent(e);
		},
		drag: function(e) 
		{
			if(o.crHasSort) o.sort = false;
			if(o.Resizable._handle === null) {
				try {
					o.Resizable.resize(
						o.Resizable._cell.getAttribute(o.prfxCrColIndex), 
						(TF.Evt.pointerX(e) - TF.Evt.objPosition(o.Resizable._cell,['th','td'])[0]) - o.crWidthAdjustment 
					);
				} catch(e) {}
			} else {
				var pointerX = (o.gridLayout) ? TF.Evt.pointerX(e) - (tf_StandardBody().scrollLeft + o.tblCont.scrollLeft) : TF.Evt.pointerX(e);
				o.Resizable._handle.style.left = pointerX+'px';
			}
			return false;
		},
		pointerPos: function(obj, x, y) 
		{
			var offset = TF.Evt.objPosition(obj,['th','td']);
			return (y >= offset[1] &&
					y <  offset[1] + obj.offsetHeight &&
					x >= offset[0] + obj.offsetWidth - 5 &&
					x <  offset[0] + obj.offsetWidth);
		},
		_onHandle : false,
		_cell : null,
		_tbl : null,
		_handle : null
	};
	
	o.Resizable.init();
	o.colsResizerExtLoaded = true;
}

TF.prototype.RemoveColsResizer = function()
{
	var tbl = (this.crColsHeadersTbl) ? o.crColsHeadersTbl : this.tbl;
	var headerIndex = (this.crColsHeadersTbl) 
						? this.crColsHeadersIndex : this.GetHeadersRowIndex();
	
	this.colsResizer = false;
	
	if(this.crTableLayout=='fixed')
		tf_removeClass(this.tbl, this.crTblCssClass);
	
	if(this.crEnableTextEllipsis) 
		tf_removeClass(this.tbl, this.crTextEllipsisCssClass);
		
	for(var k=0; k<tbl.rows.length; k++)
	{
		var r = tbl.rows[k]; 
		for(var j=0; j<r.cells.length; j++)
		{
			var c = r.cells[j];
			c.removeAttribute(this.prfxCrColIndex);
			tf_removeEvent(c, 'mouseover', this.Resizable.initDetect);
			tf_removeEvent(c, 'mouseout', this.Resizable.killDetect);
		}
		if(!this.crAllCells && k==headerIndex) break;
	}
}

function tf_StandardBody()
{ 
	//create reference to common "body" across doctypes
	return (document.compatMode=="CSS1Compat")
				? document.documentElement : document.body 
}

TF.Evt = {
	pointerX: function(e)
	{
		e = e || window.event;
		return e.pageX || (e.clientX + tf_StandardBody().scrollLeft);
	},
	pointerY: function(e)
	{
		e = e || window.event;
		return e.pageY || (e.clientY + tf_StandardBody().scrollTop);
	},
	srcElement: function(e)
	{
		e = e || window.event;
		return e.srcElement || e.target;
	},
	stopEvent: function(e)
	{
		e = e || window.event;
		if (e.stopPropagation) e.stopPropagation();
		else e.cancelBubble = true; 
	},
	cancelEvent: function(e)
	{
		e = e || window.event;
		if (e.preventDefault)
			e.preventDefault();
		else
			e.returnValue = false;
	},
	objPosition: function(obj, tag)
	{
		var l = 0, t = 0;
		if (obj && obj.offsetParent && tag.tf_Has(obj.nodeName.tf_LCase())) {
			do {
				  l += obj.offsetLeft;
				  t += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		return [l,t];
	}
}

	

