define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** postShow defined for ApproveNotificationMobileSDK **/
    AS_FlexContainer_b31af7a8edad4c6585ac0b786493dd32: function AS_FlexContainer_b31af7a8edad4c6585ac0b786493dd32(eventobject) {
        var self = this;

        function ROTATE_ACTION_eb49d1d8c42e4dd7beacfbd8868e45d4_Callback() {}

        function ROTATE_ACTION_adf6b6eab5d14bb2a3da9b5802ff5b83_Callback() {}

        function ROTATE_ACTION_b2c0c2ab9453418c81b80a0344305905_Callback() {}

        function ROTATE_ACTION_c44a0eccb9b24bf99cb66222f20479a5_Callback() {}
        var trans100 = kony.ui.makeAffineTransform();
        trans100.rotate(45);
        self.view.flxApproveLineUp.animate(
        kony.ui.createAnimation({
            "100": {
                "anchorPoint": {
                    "x": 1,
                    "y": 1
                },
                "stepConfig": {
                    "timingFunction": kony.anim.EASE
                },
                "transform": trans100
            }
        }), {
            "delay": 0,
            "duration": 0.001,
            "fillMode": kony.anim.FILL_MODE_FORWARDS,
            "iterationCount": 1
        }, {
            "animationEnd": ROTATE_ACTION_c44a0eccb9b24bf99cb66222f20479a5_Callback
        });
        var trans100 = kony.ui.makeAffineTransform();
        trans100.rotate(315);
        self.view.flxApproveLineDown.animate(
        kony.ui.createAnimation({
            "100": {
                "anchorPoint": {
                    "x": 1,
                    "y": 1
                },
                "stepConfig": {
                    "timingFunction": kony.anim.EASE
                },
                "transform": trans100
            }
        }), {
            "delay": 0,
            "duration": 0.001,
            "fillMode": kony.anim.FILL_MODE_FORWARDS,
            "iterationCount": 1
        }, {
            "animationEnd": ROTATE_ACTION_b2c0c2ab9453418c81b80a0344305905_Callback
        });
        var trans100 = kony.ui.makeAffineTransform();
        trans100.rotate(45);
        self.view.flxDenyLineUp.animate(
        kony.ui.createAnimation({
            "100": {
                "anchorPoint": {
                    "x": 0.01,
                    "y": 1
                },
                "stepConfig": {
                    "timingFunction": kony.anim.EASE
                },
                "transform": trans100
            }
        }), {
            "delay": 0,
            "duration": 0.001,
            "fillMode": kony.anim.FILL_MODE_FORWARDS,
            "iterationCount": 1
        }, {
            "animationEnd": ROTATE_ACTION_adf6b6eab5d14bb2a3da9b5802ff5b83_Callback
        });
        var trans100 = kony.ui.makeAffineTransform();
        trans100.rotate(315);
        self.view.flxDenyLineDown.animate(
        kony.ui.createAnimation({
            "100": {
                "anchorPoint": {
                    "x": 0.01,
                    "y": 1
                },
                "stepConfig": {
                    "timingFunction": kony.anim.EASE
                },
                "transform": trans100
            }
        }), {
            "delay": 0,
            "duration": 0.001,
            "fillMode": kony.anim.FILL_MODE_FORWARDS,
            "iterationCount": 1
        }, {
            "animationEnd": ROTATE_ACTION_eb49d1d8c42e4dd7beacfbd8868e45d4_Callback
        });
    },
    /** onClick defined for flxSliderMain **/
    AS_FlexContainer_fcf322a0f4f8400f81c24823f9c60fab: function AS_FlexContainer_fcf322a0f4f8400f81c24823f9c60fab(eventobject) {
        var self = this;

        function ROTATE_ACTION_d05d002b36634d6aa90171406a5a5f91_Callback() {}
        var trans100 = kony.ui.makeAffineTransform();
        trans100.rotate(45);
        self.view.flxSlider.animate(
        kony.ui.createAnimation({
            "100": {
                "anchorPoint": {
                    "x": 1,
                    "y": 1
                },
                "stepConfig": {
                    "timingFunction": kony.anim.EASE
                },
                "transform": trans100
            }
        }), {
            "delay": 0,
            "duration": 0.001,
            "fillMode": kony.anim.FILL_MODE_FORWARDS,
            "iterationCount": 1
        }, {
            "animationEnd": ROTATE_ACTION_d05d002b36634d6aa90171406a5a5f91_Callback
        });
    },
    /** onTouchStart defined for imgClosePR **/
    AS_Image_cbeba44bd6fd4bc8ac2766497dd08f3c: function AS_Image_cbeba44bd6fd4bc8ac2766497dd08f3c(eventobject, x, y) {
        var self = this;
        this.view.flxErrorPwdPR.setVisibility(false);
    }
});