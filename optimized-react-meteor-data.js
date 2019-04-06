/*
Created at my FREE time for FREE usage
author Nazarii Strohush https://github.com/nazariistrohush
https://github.com/NazariiStrohush/optimized-react-meteor-data
2019
*/

import React from 'react';
import { Tracker } from 'meteor/tracker';

const trueFn = () => true;

export const pureWithTracker = function (...args) {
	return function (WrappedComponent) {
		return class PureWithTracker extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					trackerResult: {},
				};
				this.shouldRerunTracker = trueFn;

				if (typeof args[0] === 'function') {
					if (typeof args[1] === 'function') {
						this.shouldRerunTracker = args[0];
						this.trackerFn = args[1];
					} else {
						this.trackerFn = args[0];
					}
				}
			}

			componentWillReceiveProps(nextProps) {
				if (this.shouldRerunTracker(this.props, nextProps)) {
					this.setState({
						trackerResult: this.trackerFn(nextProps),
					})
				}
			}

			componentDidMount() {
				this.trackerHandler = Tracker.autorun(() => {
					this.setState({
						trackerResult: this.trackerFn(this.props),
					});
				});
			}

			componentWillUnmount() {
				if (this.trackerHandler) {
					this.trackerHandler.stop();
				}
			}

			render() {
				return <WrappedComponent {...this.props} {...this.state.trackerResult} />
			}
		};
	}
};

