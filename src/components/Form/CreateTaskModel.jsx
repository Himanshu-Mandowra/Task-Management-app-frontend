import { useState } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

function CreateTaskModal({ isOpen, onClose, onSubmitTask }) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const { users } = useSelector((state) => state.user);
  console.log("This is users form Dispatch: ", users);

  console.log(users);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      assignedName: "",
      dueDate: "",
      status: "TO DO",
    },
  });

  const assignedToField = register("assignedTo", {
    required: "Please select a user",
  });

  if (!isOpen) return null;

  // Handles updating both assignedTo ID and text string smoothly when user selects an option
  const handleAssigneeChange = (e) => {
  const selectedUserId = e.target.value;

  setValue("assignedTo", selectedUserId, {
    shouldValidate: true,
  });

  const selectedUser = users.find(
    (u) => u._id === selectedUserId
  );

  setValue(
    "assignedName",
    selectedUser?.userName || ""
  );
};

  // Validates current step inputs strictly before allowing progress
  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ["title", "description"];
    if (step === 2) fieldsToValidate = ["assignedTo"];

    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < totalSteps) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const onFormSubmit = (data) => {
    if (step !== totalSteps) return;
    onSubmitTask(data);
    reset();
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {/* Short Height Panel Container */}
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden transform transition-all flex flex-col">
        {/* HEADER SECTION */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Create New Task
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of {totalSteps}
            </p>
          </div>
          <button
          type="button"
            onClick={() => {
              reset();
              setStep(1);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* COMPACT PROGRESS STEP INDICATOR */}
        <div className="flex h-1 w-full bg-slate-100">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* MODAL FORM ACTION */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 flex flex-col"
        >
          {/* STEP FIELDS WRAPPER (Low Height Context Box) */}
          <div className="p-6 min-h-[190px] flex flex-col justify-center">
            {/* STEP 1: Core Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("title", {
                      required: "Task title is required",
                    })}
                    placeholder="e.g., Migrate Database to v4 Cluster"
                    className={`w-full px-4 py-2 text-base border rounded-xl outline-none transition-all shadow-sm ${
                      errors.title
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs font-semibold text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    {...register("description", {
                      required: "Description is required",
                    })}
                    placeholder="Briefly detail what needs to be delivered..."
                    className={`w-full px-4 py-2 text-base border rounded-xl outline-none transition-all shadow-sm resize-none ${
                      errors.description
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs font-semibold text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Assignee Configuration */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Assign To Team Member
                  </label>
                  <select
                    {...assignedToField}
                    value={watch("assignedTo") || ""}
                    onChange={handleAssigneeChange}
                    className="w-full px-4 py-2.5 text-base border border-slate-200 bg-white rounded-xl outline-none focus:border-blue-500 shadow-sm appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.userName} ({user.userRole})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No users available
                      </option>
                    )}
                  </select>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Selecting a team member maps internal metadata tracking values
                  automatically.
                </p>
              </div>
            )}

            {/* STEP 3: Dates & Status Control */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      {...register("dueDate")}
                      className="w-full px-4 py-2 text-base border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Initial Status
                    </label>
                    <select
                      {...register("status")}
                      className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="TO DO">TO DO</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  Once created, progress feeds change notifications directly
                  into your dashboard panels.
                </p>
              </div>
            )}
          </div>

          {/* COMPACT ACTIONS BUTTON FOOTER */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
            {/* Back Button */}
            <button
              type="button"
              onClick={prevStep}
              className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${
                step === 1 ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {/* Next or Finish Button */}
              {step < totalSteps ? (
                <button
                 key="continue-btn"
                  type="button"
                  onClick={() => {nextStep(); console.log("This is continue button");}}
                  className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/10"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                key="submit-btn"
                  type="submit"
                  className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all shadow-sm shadow-green-500/10"
                >
                  <CheckCircle2 size={16} /> Save Deliverable
                </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
