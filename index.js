import React from 'react';

import { Plugin } from '@vizality/entities';
import { patch, unpatch } from '@vizality/patcher';
import { getModuleByDisplayName } from '@vizality/webpack';
var typingConstant;
var typingPatch;
const ToggleIcon = require("./components/ToggleIcon")

export default class SilentTyping extends Plugin {

    async start () {
        
        self = this;
        function setup(){
            var { typing } = require('@vizality/webpack');
            typingConstant = typing;
            if (!typingConstant || typingConstant == null || typeof(typingConstant) == 'null'){
                console.warn("Typing is undefined, retrying.");
                setTimeout(function(){
                    setup();
                }, 1000)
                return;
            }

            self.enabledSilentTyping = true;
            // literally yoinked this from vz code and modified it :)
            typingConstant.startTyping = (startTyping => channel => setImmediate(() => {
                if (self.settings.get("silent-typing-enabled", true)){
                    return typingConstant.stopTyping(channel);
                }
                return self.oldStartTyping(channel);
            }))(self.oldStartTyping = typingConstant.startTyping);
        }
        setup();

        // inject into that juicy top bar
        
        const HeaderBarContainer = await getModuleByDisplayName("HeaderBarContainer")
        typingPatch = patch("channel-bar", HeaderBarContainer.prototype, "render", (args, res)=>{
            res.props.toolbar.props.children.unshift(<ToggleIcon settings={this.settings} bartype={HeaderBarContainer.Icon}></ToggleIcon>)
            return res;
        })
    }

    stop () {
        console.log("Resetting typing hook for silent typing to normal state.")
        if (typingConstant){
            typingConstant.startTyping = this.oldStartTyping;
        }
    }
}
