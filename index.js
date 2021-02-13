import React from 'react';

import { Plugin } from '@vizality/entities';
import { patch, unpatch } from '@vizality/patcher';
import { getModuleByDisplayName, typing } from '@vizality/webpack';

const ToggleIcon = require("./components/ToggleIcon")

export default class SilentTyping extends Plugin {

    async start () {
        // literally yoinked this from vz code and modified it :)

        console.log("Enabling typing hook for silent typing.")
        this.enabledSilentTyping = true;
        typing.startTyping = (startTyping => channel => setImmediate(() => {
            if (this.settings.get("silent-typing-enabled", true)){
                return typing.stopTyping(channel);
            }
            return this.oldStartTyping(channel);
        }))(this.oldStartTyping = typing.startTyping);

        // inject into that juicy top bar
        
        const HeaderBarContainer = await getModuleByDisplayName("HeaderBarContainer")
        patch("channel-bar", HeaderBarContainer.prototype, "render", (args, res)=>{
            res.props.toolbar.props.children.unshift(<ToggleIcon settings={this.settings} bartype={HeaderBarContainer.Icon}></ToggleIcon>)
            return res;
        })
    }

    stop () {
        console.log("Resetting typing hook for silent typing to normal state.")
        unpatch("channel-bar")
        typing.startTyping = this.oldStartTyping;
    }
}
