export class Global {
  public static VinNum = '';
  //*********local url **************/
  //  public static DLMS_API_URL = 'http://localhost:52423/';
  // public static AUCTION_API_URL = 'http://localhost:53940/';
  // public static WebUrl = 'http://localhost:4203/';
  // public static PoliceURL = 'http://localhost:33587/';
  // public static WreckerTowAPIURL = 'http://localhost:59161/';
  // public static ReportPath = 'https://dev.govtow.com/Milwaukee/Reports/ReportViewer.aspx';
  // public static ZebraPrintReportPath = 'http://localhost:33587/Reports/Zebra_Print.aspx';
  // public static SoldAuctionReportPath = 'http://localhost:33587/Reports/AuctionMemoReport.aspx';

  // ********* Dev urls ***********
  // public static DLMS_API_URL = 'https://devapis.govtow.com/MKEAPI/';
  // public static AUCTION_API_URL = 'https://devapis.govtow.com/MKEAuctionAPI/';
  // public static WebUrl = 'https://dev.govtow.com/MkeWebApp/';
  // public static PoliceURL = 'https://dev.govtow.com/Milwaukee/';
  // public static WreckerTowAPIURL = 'https://dev.wreckertow.com/WreckerTowAPIV2/';
  // public static ReportPath = 'https://dev.govtow.com/Milwaukee/Reports/ReportViewer.aspx';
  // public static ZebraPrintReportPath = 'https://dev.govtow.com/Milwaukee/Reports/Zebra_Print.aspx';
  // public static SoldAuctionReportPath = 'https://dev.govtow.com/Milwaukee/Reports/AuctionMemoReport.aspx';
// ********* Dev QA urls ***********
  // public static DLMS_API_URL = 'https://qaapis.govtow.com/MKEAPI/';
  // public static AUCTION_API_URL = 'https://qaapis.govtow.com/MKEAuctionAPI/';
  // public static WebUrl = 'https://mkedevapp.govtow.com/';
  // public static PoliceURL = 'https://mkedev.govtow.com/';
  // ////public static ddocsUrl = 'https://ddocsdev.govtow.com/twain/resources/v17';
  // public static ddocsUrl = 'https://ppaddocs.govtow.com/twain/resources';
  // public static WreckerTowAPIURL = 'https://devapis.govtow.com/WreckerTowApiv2/';
  // public static ReportPath = 'https://mkedev.govtow.com/Reports/ReportViewer.aspx';
  // public static ZebraPrintReportPath = 'https://mkedev.govtow.com/Reports/Zebra_Print.aspx';
  // public static SoldAuctionReportPath = 'https://mkedev.govtow.com/Reports/AuctionMemoReport.aspx';
  // public static GoogleCaptchav2Key: any = '6LeZh7MZAAAAAGzyw9vu8QUlqe0nLgndUyoE1ynG';
  // ********* QA urls ***********
  public static DLMS_API_URL = 'https://qaapis.govtow.com/Milwaukee/';
  public static AUCTION_API_URL = 'https://qaapis.govtow.com/MKEAuctionAPI/';
  public static WebUrl = 'https://mkeqa.govtow.com/';
  public static PoliceURL = 'https://mkeqa.govtow.com/';
  public static ddocsUrl = 'https://ddocsdev.govtow.com/twain/resources/v17';
  public static WreckerTowAPIURL = 'https://dev.wreckertow.com/WreckerTowAPIV2/';
  public static ReportPath = 'https://mkeqa.govtow.com/Reports/ReportViewer.aspx';
  public static ZebraPrintReportPath = 'https://mkeqa.govtow.com/Reports/Zebra_Print.aspx';
  public static SoldAuctionReportPath = 'https://mkeqa.govtow.com/Reports/AuctionMemoReport.aspx';
  public static GoogleCaptchav2Key: any = '6LeZh7MZAAAAAGzyw9vu8QUlqe0nLgndUyoE1ynG';

  // **********Prod urls *********
  // public static DLMS_API_URL = 'https://mkeapi.govtow.com/';
  // public static AUCTION_API_URL = 'https://mkeauctionapi.govtow.com/';
  // public static WebUrl = 'https://mkeapp.govtow.com/';
  // public static PoliceURL = 'https://mke.govtow.com/';
  // public static ddocsUrl = 'https://ddocsdev.govtow.com/';
  // public static WreckerTowAPIURL = 'https://dev.wreckertow.com/WreckerTowAPIV2/';
  // public static ReportPath = 'https://mke.govtow.com/Reports/ReportViewer.aspx';
  // public static ZebraPrintReportPath = 'https://mke.govtow.com/Reports/Zebra_Print.aspx';
  // public static SoldAuctionReportPath = 'https://mke.govtow.com/Reports/AuctionMemoReport.aspx';
  // public static GoogleCaptchav2Key: any = '6LeZh7MZAAAAAGzyw9vu8QUlqe0nLgndUyoE1ynG';
  public static WreckerTowHeaderName = 'Authorization';
  public static WreckerTowHeaderValue = '1494175a-a628-4c94-a442-c7f2f005fc4e';
  public static MandatoryMessage = 'Please enter all mandatory fields';

  public static SaveMessage = 'Record Saved';
  public static UpdateMessage = 'Record Updated';
  public static DefaultState = 'WI';

  public static DeleteMessage = 'Record Deleted';
  public static UniqueEmailFailed = 'Email Id must be Unique.It Seeems Another User is already registered with this Email Id';
  public static LoginSuccessMessage = ' Hello ';
  public static LoginFailureMessage = ' Invalid Credentials';
  public static PasswordUpdateMessage = 'Password Updated';
  public static DocumentUploadMessage = 'Document Uploaded';
  public static SaveErrorMessage = '';
  public static PasswordMismatchMessage = 'Password and Confirm Password do not Match';
  public static UniqueEmailUserFailed = 'Email Id must be Unique';
  public static AuthHeaderName = 'DLMSAuth';
  public static AuthHeaderValue = 'admin';
  public static PoliceAuthHeaderName = 'DLMSAuth';
  public static PoliceAuthHeaderValue = 'swapna';
  public static DeleteConfirmationMessage = 'Are you sure want to delete?';
  public static AddCompanyConfirmationMessage = 'Would you like to add this company?';
  public static RemoveConfirmationMessage = 'Are you sure want to remove?';
  public static RemoveSelectedConfirmationMessage = 'Are you sure want to remove selected?';
  public static AuctionDatePresentMessage = 'Auction Date already present';
  public static AuctionDateRequiredtMessage = 'Auction Date required';
  public static RecordNotFoundMessage = 'Record not found';
  public static MoveConfirmationMessage = 'You are confirming the move of {0} vehicles scheduled for ' +
    '{1} to a new auction date {2}.';
  public static YearValidationMessage = 'End year should be same or greater than begin year';
  public static AuctionClosemsg = 'Auction Date closed successfully';
  public static MoveConfirmationMessageAlt = 'You are confirming the move of auction date {0} to new date {1}.';
  public static EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/;
  public static ZIP_REGEX = /^[0-9]{5}(?:-[0-9]{4})?$/;
  public static PHONE_REGEX = /\(\d{3}\) \d{3}-\d{4}/;
  public static NUMBER_REGEX = /^[0-9]+$/;
  public static phonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public static ALPHANEUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
  public static ALPHA_REGEX = /^[\-\a-zA-Z\s]*$/;
  public static ALPHA_CHAR_REGEX = /^[ A-Za-z0-9_@.\#&+-]*$/;
  public static DECIMAL_REGEX = /^[0-9]\d{0,9}(\.\d{1,2})?%?$/;
  public static UniqueEquipmentTagFailed = 'Equipment Tag must be Unique';
  public static UniqueLicensePlateFailed = 'License Plate must be Unique';
  public static UniqueVINFailed = 'VIN must be Unique';
  public static InvoiceGeneratedMessage = 'Invoice Generated';
  public static TowCompanyRegistrationMsg = 'Registration Successful.Now you can add Drivers and Equipments.';
  public static ServiceExistsMsg = 'Selected Service already exists in your Service List';
  public static BidderActiveMsg = 'Bidder already assigned in auction and can not be blocked';
  public static BidderAssignMsg = 'Bidder is blocked and can not be assigned'
  public static FullImagePath = Global.WebUrl + 'assets/loader.gif';
  public static UniqueContractIdFailed = 'Contract Id must be Unique';
  public static CancelledMessage = 'Record Cancelled';
  public static NobuyerMessage = 'You have selected to be buyers representative. Please add a company or select No';
  // public static GoogleMapAPIKey = 'AIzaSyA_229i8sdM33cK5Widoomx1JFGB9yr1gg';
  public static SelectRecordMessage = 'Select at least one record';
  public static GoogleMapAPIKey = 'AIzaSyCyzATQE2BYCfxvj40W_--m-z_pNjZRm7w';
  //public static GoogleMapAPIKey = 'AIzaSyCeuLWeImbjN_kHGw_E-8U1_aF0g3YwAxE';
  public static PageSize = 50;
  public static RecordsDeletedMessage = 'Records Deleted';
  public static ReversePaymentSuccessMessage = 'Payment Reversed';
  public static SetHeightTime = 1000;
  public static CloseDateConfirmationMessage = 'Are you sure want to close Auction Date?';
  public static PRICE_REGEX = /^(\$?\d{1,3}(,?\d{3})*)?(\.\d{1,2})?$/; //$99.99|99.99|99
  public static DefaultLot = 6;
  //public static ReverseNoSaleSuccessMessage = 'No Sale Reversed';
  public static PRICE_REGEXN = /^(-?\$?\d{1,3}(,?\d{3})*)?(\.\d{1,2})?$/; //-$99.99|-99.99|-99
  public static StorageFeeId = 2;
  public static QUANTITY_REGEX = /^([1-9][0-9]*)$/; //1|10|100
  public static ReleasedMessage = 'Vehicle Released';
  public static StorageFeeCategoryId = 1;
  public static StateId = 47;
  public static ABANWAITHOURS = 2;//72
  public static ABANCONFIRMWAITHOURS = 1;//24
  public static FILE_MAX_SIZE = 5242880;
  public static EVIDENCELOT_Message = 'Vehicle is currently stored at Evidence Lot, Please check with supervisor/MPD before processing.';

}
