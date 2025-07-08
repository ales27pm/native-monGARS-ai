import Foundation

protocol ModelDownloaderDelegate: AnyObject {
    func downloadDidUpdate(modelId: String, progress: Float)
    func downloadDidFinish(modelId: String, at location: URL)
    func downloadDidFail(modelId: String, error: Error)
}

class ModelDownloader: NSObject, URLSessionDownloadDelegate {
    weak var delegate: ModelDownloaderDelegate?
    private var activeDownloads: [String: URLSessionDownloadTask] = [:]

    private lazy var urlSession: URLSession = {
        let identifier = "com.mongars.ai.backgroundModelDownloader"
        let config = URLSessionConfiguration.background(withIdentifier: identifier)
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = true
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    func startDownload(modelId: String, url: URL) {
        let task = urlSession.downloadTask(with: url)
        task.taskDescription = modelId
        task.resume()
        activeDownloads[modelId] = task
    }

    func cancelDownload(modelId: String) {
        activeDownloads[modelId]?.cancel()
        activeDownloads.removeValue(forKey: modelId)
    }

    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        guard let modelId = downloadTask.taskDescription else { return }
        delegate?.downloadDidFinish(modelId: modelId, at: location)
        activeDownloads.removeValue(forKey: modelId)
    }

    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                    didWriteData bytesWritten: Int64,
                    totalBytesWritten: Int64,
                    totalBytesExpectedToWrite: Int64) {
        guard let modelId = downloadTask.taskDescription, totalBytesExpectedToWrite > 0 else { return }
        let progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
        delegate?.downloadDidUpdate(modelId: modelId, progress: progress)
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard let modelId = task.taskDescription else { return }
        if let error = error, (error as NSError).code != NSURLErrorCancelled {
            delegate?.downloadDidFail(modelId: modelId, error: error)
        }
        activeDownloads.removeValue(forKey: modelId)
    }
}


