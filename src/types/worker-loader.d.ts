declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "sharedworker-loader*" {
  class WebpackSharedWorker extends SharedWorker {
      constructor();
  }

  export = WebpackSharedWorker;
}