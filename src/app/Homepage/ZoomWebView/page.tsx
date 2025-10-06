"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ZoomWebViewPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get Zoom meeting data from URL parameters
    const zoomData = searchParams.get('ZoomMeetingNumber');
    
    if (!zoomData) {
      setError("No meeting data provided");
      setIsLoading(false);
      return;
    }

    try {
      // Parse the Zoom meeting data
      const ZoomMeetingNumber = JSON.parse(zoomData);
      
      console.log("Data ===>", ZoomMeetingNumber);
      
      // Create the Zoom meeting URL
      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);
      const queryParams = new URLSearchParams();
      queryParams.append('ZoomMeetingNumber', zoomMeetingNumberString);
      const queryString = queryParams.toString();
      
      console.log("zoom data ===>", zoomMeetingNumberString);
      const uri = `https://samsara-zoom-web-view.vercel.app/cdn?${queryString}`;
      console.log("URL Updated ==>", uri);
      
      setUrl(uri);
      setIsLoading(false);
    } catch (err) {
      console.error("Error parsing meeting data:", err);
      setError("Invalid meeting data");
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleBack = () => {
    router.back();
  };

  const handleWebViewLoad = () => {
    console.log("WebView loaded successfully");
  };

  const handleWebViewError = (error: any) => {
    console.error("WebView error:", error);
    setError("Failed to load meeting. Please try again.");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-50">
        {/* Floating Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading meeting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-50">
        {/* Floating Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Join Meeting</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Floating Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
      >
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>

      {/* Full Screen WebView */}
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="Zoom Meeting"
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        allow="camera; microphone; fullscreen; autoplay; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
