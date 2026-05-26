import type { Metadata } from 'next';
import { ShieldAlert, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DMCA & Copyright Policy - tappytoon.org',
  description: 'Digital Millennium Copyright Act (DMCA) and Copyright Policy for tappytoon.org.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 p-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">DMCA & Copyright Policy</h1>
              <p className="text-gray-500 font-medium mt-1">Digital Millennium Copyright Act Notice</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 prose prose-gray max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary">
            <h2 className="text-xl font-black mt-0">No Files Hosted on Our Servers</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
              tappytoon.org operates strictly as a search engine and indexer for manga and manhwa content. 
              <strong> We do not host, store, or upload any comic files, image pages, or media on our own servers.</strong> 
              All content displayed on this website is dynamically fetched and served from non-affiliated third-party APIs (such as MangaDex) via their public endpoints.
            </p>

            <h2 className="text-xl font-black mt-8">Copyright Infringement</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
              tappytoon.org respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA). 
              If you are a copyright owner or an agent thereof and believe that any content indexed on this site infringes upon your copyrights, 
              please note that removing the entry from our index does not remove it from the original third-party hosting source.
            </p>

            <h2 className="text-xl font-black mt-8">Takedown Requests</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
              To request the removal of an indexed entry from tappytoon.org, please provide a written communication that includes the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 font-medium marker:text-primary">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled. <strong>(Provide the exact URLs on our site).</strong></li>
              <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            </ul>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Submit a DMCA Notice</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">
                We will promptly process and investigate valid DMCA notices and will remove or disable access to the indexed content.
              </p>
              <a href="mailto:dmca@tappytoon.org">
                <Button className="font-bold rounded-full px-8 shadow-md">
                  Email dmca@tappytoon.org
                </Button>
              </a>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/">
                <Button variant="outline" className="font-bold rounded-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
