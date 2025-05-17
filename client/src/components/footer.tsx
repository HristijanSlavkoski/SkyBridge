const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SkyBridge</h3>
            <p className="text-gray-400 text-sm">Global satellite-powered emergency medical assistance for any situation, anywhere in the world.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Services</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Medical Consultation</a></li>
              <li><a href="#" className="hover:text-white">Hospital Finder</a></li>
              <li><a href="#" className="hover:text-white">Medicine Delivery</a></li>
              <li><a href="#" className="hover:text-white">Emergency Response</a></li>
              <li><a href="#" className="hover:text-white">Helicopter Evacuation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Contact Support</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SkyBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
