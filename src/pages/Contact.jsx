import { useState, useEffect } from "react";
import { FiMapPin, FiMail, FiPhone, FiClock } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Environment-specific backend API base URL
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Pre-fills profile details if an active session state exists
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setFormData((prev) => ({
          ...prev,
          name: parsedUser.name || "",
          email: parsedUser.email || "",
        }));
      } catch (error) {
        console.error("Failed to recover user session metadata:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Validates form parameters and processes message submissions.
   * Performs sanitization and regex structural syntax validation.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameStr = formData.name.trim();
    const emailStr = formData.email.trim().toLowerCase();
    const subjectStr = formData.subject.trim();
    const messageStr = formData.message.trim();

    if (!nameStr || !emailStr || !subjectStr || !messageStr) {
      toast.error("All fields are required. Please complete the form.");
      return;
    }

    const textPattern = /^[A-Za-z\s]+$/;
    if (!textPattern.test(nameStr)) {
      toast.error(
        "Please enter a valid name using only alphabetic characters.",
      );
      return;
    }
    if (!textPattern.test(subjectStr)) {
      toast.error("Please enter a valid subject string.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailStr)) {
      toast.error("Please provide a valid email address.");
      return;
    }

    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
    ];
    const userDomain = emailStr.split("@")[1];

    if (!allowedDomains.includes(userDomain)) {
      toast.error(
        "Please use an authentic email domain (e.g., Gmail, Outlook, Yahoo).",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_BASE}/api/contact`, {
        name: nameStr,
        email: emailStr,
        subject: subjectStr,
        message: messageStr,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Thank you. Your message has been received.",
        );

        setFormData((prev) => ({
          ...prev,
          subject: "",
          message: "",
        }));
      } else {
        toast.error(
          response.data.message ||
            "Unable to submit your request at this time.",
        );
      }
    } catch (error) {
      console.error("Contact Form Processing Anomaly:", error);
      const backendError = error.response?.data?.message;
      toast.error(
        backendError || "Server communication failure. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Editorial Page Header Banner */}
      <section
        id="page-header"
        className="w-full h-[40vh] flex flex-col justify-center items-center text-center p-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url('/img/about/banner.png')` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-wider z-10 font-mono">
          #Let's_Talk
        </h2>
        <p className="text-sm md:text-base text-zinc-200 mt-2 tracking-wide z-10 font-medium">
          Leave A Message. We Love To Hear From You!
        </p>
      </section>

      {/* Corporate Locations Framework */}
      <section
        id="contact-details"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-12"
      >
        <div className="details w-full lg:w-[40%] space-y-6">
          <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 block">
            GET IN TOUCH
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 leading-snug">
            Visit one of our agency locations or contact us today
          </h2>
          <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
            Head Office
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <FiMapPin size={18} className="text-[#088178] shrink-0 mt-1" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                56 Oxford Street Angles New Delhi
              </p>
            </li>
            <li className="flex items-start gap-4">
              <FiMail size={18} className="text-[#088178] shrink-0 mt-1" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                contact@example.com
              </p>
            </li>
            <li className="flex items-start gap-4">
              <FiPhone size={18} className="text-[#088178] shrink-0 mt-1" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                +01 2222 345 / (+91) 123456789
              </p>
            </li>
            <li className="flex items-start gap-4">
              <FiClock size={18} className="text-[#088178] shrink-0 mt-1" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                Monday to Saturday: 09.00 AM to 10.00 PM
              </p>
            </li>
          </ul>
        </div>

        {/* Geospatial Map Container */}
        <div className="map w-full lg:w-[55%] h-100 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl">
          <iframe
            src="https://maps.google.com/maps?q=New%20Delhi&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          ></iframe>
        </div>
      </section>

      {/* Structured Inquiries Communication Interface */}
      <section
        id="form-details"
        className="max-w-7xl mx-auto my-4 sm:my-8 px-4 py-12 sm:p-16 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-16 bg-zinc-50/50 dark:bg-zinc-900/30"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-[55%] flex flex-col space-y-4"
        >
          <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 block">
            LEAVE A MESSAGE
          </span>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 pb-2">
            We Love To Hear From You
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-sm outline-none focus:border-[#088178] text-zinc-800 dark:text-white transition-all shadow-sm font-medium"
          />
          <input
            type="text"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-sm outline-none focus:border-[#088178] text-zinc-800 dark:text-white transition-all shadow-sm font-medium"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-3.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-sm outline-none focus:border-[#088178] text-zinc-800 dark:text-white transition-all shadow-sm font-medium"
          />
          <textarea
            name="message"
            rows="6"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-sm outline-none focus:border-[#088178] text-zinc-800 dark:text-white transition-all shadow-sm font-medium resize-none"
          ></textarea>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#088178] text-white font-semibold text-sm rounded-xl tracking-wider shadow-md transition-all duration-200 ease-out transform cursor-pointer hover:bg-[#06635c] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(8,129,120,0.3)] active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            >
              SUBMIT
            </button>
          </div>
        </form>

        {/* Corporate Representatives Presentation Profile */}
        <div className="people w-full lg:w-[38%] flex flex-col justify-center items-center lg:items-start space-y-8 lg:pl-6">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 w-full justify-center lg:justify-start">
            <img
              src="img/people/1.png"
              alt="John Louis"
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm"
            />
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="block text-base font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                John Louis
              </span>
              Senior Marketing Manager <br /> Phone: + 000 111 222 <br /> Email:
              contact@example.com
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 w-full justify-center lg:justify-start">
            <img
              src="img/people/3.png"
              alt="Emma Stone"
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm"
            />
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="block text-base font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                Emma Stone
              </span>
              Senior Marketing Manager <br /> Phone: + 999 888 777 <br /> Email:
              contact@example.com
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 w-full justify-center lg:justify-start">
            <img
              src="img/people/2.png"
              alt="William Moriarty"
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm"
            />
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="block text-base font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                William Moriarty
              </span>
              Senior Marketing Manager <br /> Phone: + 000 555 666 <br /> Email:
              contact@example.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
