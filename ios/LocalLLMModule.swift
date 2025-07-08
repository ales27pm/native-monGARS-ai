import Foundation
import CoreML
import MLX
import MLXFast
import Tokenizers
import SWCompression

@objc(LocalLLMModule)
class LocalLLMModule: RCTEventEmitter, ModelDownloaderDelegate {

    private let downloader = ModelDownloader()
    private var hasListeners = false
    private var activeModel: MLModel? = nil
    private var tokenizer: Tokenizer? = nil

    override init() {
        super.init()
        downloader.delegate = self
    }

    override func supportedEvents() -> [String]! {
        return ["onDownloadProgress", "onGeneratedToken", "onGenerationEnd"]
    }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    private func sendEvent(withName name: String, body: Any?) {
        if hasListeners {
            self.sendEvent(withName: name, body: body)
        }
    }

    func downloadDidUpdate(modelId: String, progress: Float) {
        sendEvent(withName: "onDownloadProgress", body: ["modelId": modelId, "progress": progress])
    }
    func downloadDidFinish(modelId: String, at location: URL) {
        sendEvent(withName: "onDownloadProgress", body: ["modelId": modelId, "progress": 1.0])
    }
    func downloadDidFail(modelId: String, error: Error) {
        sendEvent(withName: "onGenerationEnd", body: ["error": error.localizedDescription])
    }

    private func applyChatTemplate(messages: [[String: String]]) -> String {
        var prompt = "<|begin_of_text|>"
        for message in messages {
            guard let role = message["role"], let content = message["content"] else { continue }
            prompt += "<|start_header_id|>\(role)<|end_header_id|>\n\n\(content)<|eot_id|>"
        }
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
        return prompt
    }

    @objc(generateStream:resolver:rejecter:)
    func generateStream(messages: [[String: String]], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let model = activeModel, self.tokenizer != nil else {
            let errorMsg = "Aucun modèle n'est actif."
            self.sendEvent(withName: "onGenerationEnd", body: ["error": errorMsg])
            reject("no_model_active", errorMsg, nil); return
        }

        resolve(nil)

        Task(priority: .userInitiated) {
            do {
                let prompt = self.applyChatTemplate(messages: messages)
                let stream = model.generate(prompt: prompt, temp: 0.7) { token in
                    self.sendEvent(withName: "onGeneratedToken", body: ["token": token])
                }
                _ = try await stream.map { $0 }.joined()
                self.sendEvent(withName: "onGenerationEnd", body: nil)
            } catch {
                let errorMsg = "La génération de texte a échoué: \(error.localizedDescription)"
                self.sendEvent(withName: "onGenerationEnd", body: ["error": errorMsg])
            }
        }
    }
}


