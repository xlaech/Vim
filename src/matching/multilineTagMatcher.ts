import { Position } from '../motion/position';
import * as _ from 'lodash';
export class MultilineTagMatcher {
  private corpus: string[];
  private position: Position;

  /**
   *
   */
  constructor(corpus: string, position: Position) {
    this.corpus = corpus.split('\n');
    this.position = position;
  }

   public findOpeningTag() : Position | undefined {
    // check initial boundaries
    if (this.position.line < 0 || this.position.line >= this.corpus.length) {
      return undefined;
    }

    // saves how many closing tags we need to close to find the true opening tag
    var depth = 1;

    for (var lineNbr of _.rangeRight(0, this.position.line + 1)) {
      // find all Tags in this line
      // if this is the current line, only until our cursor
      var tagSearch = lineNbr === this.position.line ?
                        this.corpus[lineNbr].substr(0, this.position.character) :
                        this.corpus[lineNbr];

      var tags = tagSearch.match(/<[a-zA-Z0-9/]*>/gi);
      if (tags === null) {
        continue;
      }

      // from the end of the line, look at all tags
      for (var tag of tags.reverse()) {
        // if this is a closing tag, increase depth
        // else decrease

        if (tag.match("</.*>") !== null) {
          depth++;
        } else {
          depth--;

          // if depth is 0, we have found the opening tag :)
          if (depth === 0) {
            return new Position(
                        lineNbr, // the line we searched now
                        this.corpus[lineNbr].indexOf(tag) + tag.length); // the tags position + its length
                                                                         // (we dont want to e.g. delete the tag itself)
          }
        }
      }
    }

    // We have not found an opening tag :(
    return undefined;
   }


   public findClosingTag() : Position | undefined {
    // check initial boundaries
    if (this.position.line < 0 || this.position.line >= this.corpus.length) {
      return undefined;
    }

    // saves how many opening tags we need to close to find the true closing tag
    var depth = 1;

    for (var lineNbr of _.range(this.position.line, this.corpus.length)) {
      // find all Tags in this line
      // if this is the current line, only until our cursor
      var tagSearch = lineNbr === this.position.line ?
                        this.corpus[lineNbr].substr(this.position.character) :
                        this.corpus[lineNbr];

      var tags = tagSearch.match(/<[a-zA-Z0-9/]*>/gi);
      if (tags === null) {
        continue;
      }

      // from the end of the line, look at all tags
      for (var tag of tags) {
        // if this is a opening tag, increase depth
        // else decrease

        if (tag.match("</.*>") === null) {
          depth++;
        } else {
          depth--;

          // if depth is 0, we have found the closing tag :)
          if (depth === 0) {
            var endChar = this.corpus[lineNbr].indexOf(tag);

            if (endChar !== 0) {
              return new Position(lineNbr, endChar - 1);
            } else {
              return new Position(lineNbr, endChar);
            }
          }
        }
      }
    }

    // We have not found an closing tag :(
    return undefined;
  }
}