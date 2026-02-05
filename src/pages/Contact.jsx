import Button from "@mui/material/Button";

export default function Contact() {
  return (
    <div className="p-6 text-center" data-aos="fade-left">
      <h1 className="text-3xl font-bold text-blue-900">Contact Us     </h1>
      <p className="mt-4 text-gray-600">Feel free to reach out anytime.</p>
      <Button variant="contained" color="primary" className="mt-6">
        Send Message
      </Button>
    </div>
  );
}
