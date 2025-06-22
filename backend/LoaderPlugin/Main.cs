using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using LoaderPlugin.Commands;

namespace LoaderPlugin
{
    [Transaction(TransactionMode.Manual)]
    public class Main : IExternalCommand
    {
        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            ExportIfcAndUpload exporter = new ExportIfcAndUpload();
            return exporter.Execute(commandData, ref message, elements);
        }
    }
}
