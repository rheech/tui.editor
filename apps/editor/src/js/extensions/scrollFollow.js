/**
 * @fileoverview Implements %filltext:name=Name%
 * @author
 */

'use strict';

var extManager = require('../extManager');

/*
 * ScrollFollow
 * @exports ScrollFollow
 * @augments
 * @constructor
 * @class
 */
function ScrollFollow(cm, preview) {
    this.cm = cm;
    this.preview = preview;

    this._sectionList = null;
    this._currentSection = null;
}

ScrollFollow.prototype._addNewSection = function(start, end) {
    var newSection = this._makeSectionData(start, end);
    this._sectionList.push(newSection);
    this._currentSection = newSection;
}

ScrollFollow.prototype.getSectionList = function() {
    return this._sectionList;
};

ScrollFollow.prototype._makeSectionData = function(start, end) {
    return {
        start: start,
        end: end
    };
};

ScrollFollow.prototype._updateCurrentSectionEnd = function(end) {
    this._currentSection.end = end;
};

ScrollFollow.prototype._eachLineState = function(iteratee) {
    this.cm.eachLine(function(line) {
        var type;

        if (line.stateAfter.base.header && line.text) {
            type = 'header';
        } else {
            type = 'etc';
        }

        iteratee(type, line.lineNo());
    });
};

ScrollFollow.prototype.makeSectionList = function() {
    var self = this;

    this._sectionList = [];

    this._eachLineState(function(type, lineNumber) {
        if (lineNumber === 0 || type === 'header') {
            self._addNewSection(lineNumber, lineNumber);
        } else {
            self._updateCurrentSectionEnd(lineNumber);
        }
    });
};

//scollFollow Extension
extManager.defineExtension('scrollFollow', function(editor) {
    var cm = editor.getCodeMirror();

    var scrollFollow = editor.scrollFollow = new ScrollFollow(cm, editor.preview);
});
/*
extManager.defineExtension('scrollFollow', function(editor) {
    var cm = editor.getCodeMirror();

    window.d = cm;

    var sectionlist;
    var lastSection;
    var beforeSectionlist;

    cm.on('change', function() {
        beforeSectionlist = sectionlist;
        sectionlist = [];

         for (var i = 0; i < cm.getDoc().lineCount(); i+=1) {
            var state = cm.getStateAfter(i);
            var type;

            if (state.base.header) {
                type = 'header';
            } else {
                type = 'block';
            }

            //헤더영역 다음 빈칸이 헤더로 취급되는부분 해결
            if (type === 'header' && !cm.getLine(i)) {
                type = 'blank';
            }

            if (!lastSection || type === 'header') {
                lastSection = {
                    type: type,
                    content: cm.getLine(i),
                    start: i,
                    end: i,
                    state: state
                }

                sectionlist.push(lastSection);
            } else {
                lastSection.end = i;
                lastSection.content += cm.getLine(i)
            }
        }

        lastSection = null;

        console.log(sectionlist);
    });

    editor.on('previewRenderAfter', function(preview) {
        var sections = [];

        sections[0] = [];

        preview.$el.find('.previewContent').contents().filter(function() {
            return this.nodeType === Node.ELEMENT_NODE;
        }).each(function(index, el) {
            if (el.tagName.match(/H1|H2|H3|H4|H5|H6/)) {
                if (sections[sections.length - 1].length) {
                    sections.push([]);
                }
            }

            sections[sections.length - 1].push(el);
        });

        sections.forEach(function(childs, index) {
            $(childs).wrapAll('<div class="content-id-'+ index + '"></div>');
        });
    });

    //cm.on('cursorActivity', ne.util.throttle(function() {
    cm.on('scroll', ne.util.throttle(function() {
        var cursor;
        var scrollInfo = cm.getScrollInfo();
        var sectionIndex;
        var markdownBottom = scrollInfo.height - scrollInfo.top <= scrollInfo.clientHeight;

        cursor = d.coordsChar({left: scrollInfo.left, top: scrollInfo.top}, 'local');


        for (sectionIndex = 0; sectionIndex < sectionlist.length; sectionIndex+=1) {
            if (cursor.line <= sectionlist[sectionIndex].end) {
                break;
            }
        }

        if (sectionIndex >= sectionlist.length) {
            sectionIndex = sectionlist.length - 1;
        }

        if(!sectionlist[sectionIndex]) {
            return;
        }

        var sectionHeight = cm.heightAtLine(sectionlist[sectionIndex].end, 'local') - cm.heightAtLine(sectionlist[sectionIndex].start, 'local');
        var gap = cm.heightAtLine(cursor.line, 'local') - cm.heightAtLine(sectionlist[sectionIndex].start, 'local');

        gap = gap > 0 ? gap : 0;

        var ratio = gap / sectionHeight;

        ratio = ratio ? ratio : 0;

        var el = editor.preview.$el.find('.previewContent > .content-id-' + sectionIndex);

        console.log('mardown target', sectionlist[sectionIndex].content);

        //프리뷰에 렌더되기 전일경우는 무시
        if (el.length) {
            el = el[0];
            console.log('preview target', el.innerHTML);
            var scrollTop = markdownBottom ? editor.preview.$el.find('.previewContent').height() : el.offsetTop + ($(el).height() * ratio);

            console.log('preview scrolltop', scrollTop);

           animate(editor.preview.$el[0], editor.preview.$el.scrollTop(), scrollTop, function() {}, function() {});
        }
    }, 100));
});

var timeoutId;
var currentEndCb;

function animate(elt, startValue, endValue, stepCb, endCb) {
    if(currentEndCb) {
        clearTimeout(timeoutId);
        currentEndCb();
    }
    currentEndCb = endCb;
    var diff = endValue - startValue;
    var startTime = Date.now();

    function tick() {
        var currentTime = Date.now();
        var progress = (currentTime - startTime) / 200;
        if(progress < 1) {
            var scrollTop = startValue + diff * Math.cos((1 - progress) * Math.PI / 2);
            elt.scrollTop = scrollTop;
            stepCb(scrollTop);
            timeoutId = setTimeout(tick, 1);
        }
        else {
            currentEndCb = undefined;
            elt.scrollTop = endValue;
            setTimeout(endCb, 100);
        }
    }

    tick();
}
*/
