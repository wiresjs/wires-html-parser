import { State } from "./State";


const TAG_OPENED = "1";
const TAG_CLOSING = "2";
const TAG_CLOSED = "3";
const TAG_CREATED = "4";
const TAG_OPENING = "5";
const TAG_TEXT_OPENING = "6";
const TAG_TEXT = "7";
const TAG_TEXT_END = "8";
const TAG_CONSUMED = "9";
const SUSPECTING_COMMENT = "10";
const COMMENT_PENDING = "11";
const COMMENT_CREATED = "12";
const COMMENT_CONSUMING = "13";
const COMMENT_CLOSING = "14";
const COMMENT_CLOSED = "15";
const COMMENT_RESUMED = "16";

const SUSPECTING_CLOSING_COMMENT = "14";

export default class TagAnalyzer {
    public state: State;
    constructor() {
        this.state = new State();
    }

    /**
     * isCreated - returns true or false based on it tag has been just created
     * Triggers only once
     *
     * @return {type}  description
     */
    public isCreated() {
        return this.state.has(TAG_CREATED);
    }

    /**
     * isOpened - if a tag has been opened (meaning that everything beetween <> will get there)
     *
     * @return {type}  description
     */
    public isOpened() {
        return this.state.has(TAG_OPENED);
    }

    /**
     * isClosed - when a tag is closed
     *
     * @return {type}  description
     */
    public isClosed() {
        return this.state.has(TAG_CLOSED);
    }

    /**
     * isText - if text can be consumed
     *
     * @return {type}  description
     */
    public isText() {
        return this.state.has(TAG_TEXT);
    }

    public isConsumed() {
        return this.state.has(TAG_CONSUMED);
    }

    public shouldResumeComment() {
        return this.state.once(COMMENT_RESUMED);
    }

    /**
     * isTextEnd - when text consuming should be ended
     *
     * @return {type}  description
     */
    public isTextEnd() {
        return this.state.has(TAG_TEXT_END);
    }

    public isCommentConsuming() {
        return this.state.has(COMMENT_CONSUMING);
    }

    public closeTag() {
        this.state.unset(TAG_OPENING, TAG_OPENED, TAG_OPENED);
        this.state.set(TAG_CONSUMED);
    }

    public isCommentClosed() {
        return this.state.once(COMMENT_CLOSED);
    }

    public isCommentCreated() {
        return this.state.has(COMMENT_CREATED);
    }

    /**
     * analyze - analyzer, set states based on known/existing states
     *
     *
     * @param  {type} i description
     * @return {type}   description
     */
    public analyze(i, last) {
        let state = this.state;
        if (state.has(TAG_TEXT_OPENING)) {
            state.set(TAG_TEXT);
        }
        state.clean(TAG_CLOSED, COMMENT_RESUMED, TAG_TEXT_END, TAG_TEXT_OPENING, TAG_CONSUMED);

        if (i === "/" && state.has(TAG_OPENING)) {
            state.set(TAG_CLOSING);
            state.unset(TAG_OPENING, TAG_OPENED)
        }

        if (state.once(COMMENT_CREATED)) {
            state.set(COMMENT_CONSUMING);
            return;
        }
        if (state.once(COMMENT_PENDING)) {
            if (i === "-") { // second hyphen has arrived "<!--"
                state.removeAll(); // reset all the states
                state.set(COMMENT_CREATED);

                state.set(COMMENT_CONSUMING);
                return;
            }
        }

        if (state.once(SUSPECTING_COMMENT)) {
            if (i === "-") { // "<!" has arrived, now we see the first hyphen
                state.set(COMMENT_PENDING);
            }
        }
        if (state.has(COMMENT_CLOSING)) {
            if (i === ">") {
                state.removeAll();
                state.set(COMMENT_CLOSED);
                return;
            }
        }
        // closing comment
        if (state.once(SUSPECTING_CLOSING_COMMENT)) {
            if (i === "-") {
                state.set(COMMENT_CLOSING);
            } else {
                state.set(COMMENT_RESUMED);
                state.set(COMMENT_CONSUMING);
                return;
            }
        }


        if (state.has(COMMENT_CONSUMING)) {

            if (i === "-") {
                state.set(SUSPECTING_CLOSING_COMMENT);
                state.memorizeChar(i);
                state.unset(COMMENT_CONSUMING);
                return;
            }
        }



        if (state.has(TAG_CREATED)) {
            state.unset(TAG_CREATED);
            state.set(TAG_OPENED);
        }
        if (state.has(TAG_OPENING)) {
            if (i === "!") {

                state.set(SUSPECTING_COMMENT);
            } else {
                state.set(TAG_CREATED);
            }
            state.unset(TAG_OPENING);
        }
        if (i === "<") {
            if (!state.has(TAG_OPENED)) {
                state.set(TAG_OPENING);
            }
            if (state.has(TAG_TEXT)) {
                state.set(TAG_TEXT_END);
            }
            state.unset(TAG_TEXT, TAG_TEXT_OPENING);
        }

        if (i === ">") {
            state.set(TAG_TEXT_OPENING);
            if (state.once(TAG_CLOSING)) {
                state.unset(TAG_OPENED);
                return state.set(TAG_CLOSED);
            } else {
                state.set(TAG_CONSUMED);
            }
            if (state.has(TAG_OPENED)) {
                state.unset(TAG_OPENED);
            }
        }
    }
}
